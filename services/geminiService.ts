import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { UploadedImage, DesignTaste, PosterRequirements } from '../types';
import { TEXT_GENERATION_MODEL, IMAGE_GENERATION_MODEL, IMAGE_EDITING_MODEL } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses an error from the Gemini API and throws a user-friendly error.
 * @param error The original error object caught from the API call.
 * @param context A string describing the operation that failed (e.g., 'image generation').
 */
function parseAndThrowApiError(error: any, context: string): never {
    console.error(`Gemini API Error in ${context}:`, error);

    let userFriendlyMessage = `An unknown error occurred during ${context}.`;

    if (error?.message && typeof error.message === 'string') {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('resource_exhausted') || errorMessage.includes('429')) {
             userFriendlyMessage = 'API quota exceeded. This may be a temporary rate limit or your usage allowance for the month. Please check your plan and billing details with Google AI Platform.';
        } else if (errorMessage.includes('api key not valid')) {
            userFriendlyMessage = 'The provided API Key is not valid. Please check your application configuration.';
        } else {
            // Try to get a more specific message from JSON, which is a common format for Gemini API errors
            try {
                const parsed = JSON.parse(error.message);
                if (parsed.error && parsed.error.message) {
                    userFriendlyMessage = `API Error: ${parsed.error.message}`;
                } else {
                    userFriendlyMessage = error.message;
                }
            } catch (e) {
                userFriendlyMessage = error.message; // It's not JSON, use the message as is
            }
        }
    }

    throw new Error(userFriendlyMessage);
}

/**
 * A higher-order function to add retry logic with exponential backoff for API calls.
 * @param apiCall The async function to call.
 * @param maxRetries Maximum number of retries.
 * @param initialDelay The initial delay in ms.
 */
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await apiCall();
        } catch (error: any) {
            attempt++;
            let isRateLimitError = false;
            if (error?.message && error.message.toLowerCase().includes('429')) {
                isRateLimitError = true;
            }

            if (isRateLimitError && attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error; // Re-throw if not a rate limit error or if max retries are exceeded
            }
        }
    }
    // This should not be reachable if maxRetries > 0 but is required by TypeScript.
    throw new Error('API call failed after multiple retries.');
};


const getRequirementsStringForPrompt = (requirements: PosterRequirements) => {
    const { posterType, eventName, dateTime, venue, description, callToAction, languagePreference, aspectRatio, specificGreeting, brandName, slogan, starring, director, campaignGoal } = requirements;
    let reqStr = `
- Poster Type: ${posterType}
- Primary Language: ${languagePreference}
- Aspect Ratio: ${aspectRatio}
- Description/Key Message: ${description || "Not specified"}`;

    if (eventName) reqStr += `\n- Title (Event/Product/Movie/Cause): ${eventName}`;
    if (callToAction) reqStr += `\n- Call to Action/Tagline: ${callToAction}`;

    switch (posterType) {
        case 'Event Promotion': case 'Music Concert': if (dateTime) reqStr += `\n- Date & Time: ${dateTime}`; if (venue) reqStr += `\n- Venue: ${venue}`; break;
        case 'Festival Greetings': if (specificGreeting) reqStr += `\n- Specific Greeting: ${specificGreeting}`; break;
        case 'Product Advertisement': if (brandName) reqStr += `\n- Brand Name: ${brandName}`; if (slogan) reqStr += `\n- Slogan: ${slogan}`; break;
        case 'Movie Poster': if (starring) reqStr += `\n- Starring: ${starring}`; if (director) reqStr += `\n- Director: ${director}`; if (dateTime) reqStr += `\n- Release Date: ${dateTime}`; break;
        case 'Social Cause/Awareness': if (campaignGoal) reqStr += `\n- Campaign Goal: ${campaignGoal}`; break;
        default: if (dateTime) reqStr += `\n- Date (if applicable): ${dateTime}`; if (venue) reqStr += `\n- Location (if applicable): ${venue}`; break;
    }
    return reqStr;
};


export const analyzeDesignTaste = async (images: UploadedImage[]): Promise<DesignTaste> => {
    try {
        return await withRetry(async () => {
            const imageParts = images.map(img => ({
                inlineData: { mimeType: img.mimeType, data: img.base64 }
            }));

            const prompt = `You are a sophisticated visual design analyst. Analyze these poster images to extract design preferences.
        Return a structured JSON report. CRITICAL: Return ONLY the raw JSON object, no markdown, comments, or other text.
        Adhere STRICTLY to character limits for descriptive strings. Brevity and valid JSON are paramount.`;

            const response = await ai.models.generateContent({
                model: TEXT_GENERATION_MODEL,
                contents: { parts: [...imageParts, { text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            colorPalette: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } } } },
                            typographyStyle: { type: Type.STRING, description: "EXTREMELY CONCISE, comma-separated keywords (e.g., 'Modern Sans-serif, Bold Headers'). MAX 40 CHARACTERS." },
                            layoutStyle: { type: Type.STRING, description: "EXTREMELY CONCISE description (e.g., 'Minimalist, Asymmetrical'). MAX 40 CHARACTERS." },
                            graphicStyle: { type: Type.STRING, description: "EXTREMELY CONCISE description (e.g., 'Photorealistic, Abstract Elements'). MAX 40 CHARACTERS." },
                            contentToneAndLanguage: { type: Type.STRING, description: "EXTREMELY CONCISE (e.g., 'Elegant, Formal, English'). MAX 25 CHARACTERS." },
                            designTrendsDetected: { type: Type.STRING, description: "EXTREMELY CONCISE trends (e.g., 'Swiss Design, Negative Space'). MAX 30 CHARACTERS." }
                        },
                        required: ["colorPalette", "typographyStyle", "layoutStyle", "graphicStyle", "contentToneAndLanguage", "designTrendsDetected"]
                    }
                }
            });
            
            try {
                const jsonString = response.text.trim();
                return JSON.parse(jsonString) as DesignTaste;
            } catch (e) {
                console.error("Failed to parse JSON from Gemini:", response.text, e);
                throw new Error("AI response was not valid JSON.");
            }
        });
    } catch (error) {
        parseAndThrowApiError(error, 'design taste analysis');
    }
};

export const generatePosterConcept = async (designTaste: DesignTaste, requirements: PosterRequirements): Promise<string> => {
    try {
        return await withRetry(async () => {
            const designTasteString = `- Color Palette: ${designTaste.colorPalette?.map(c => `${c.name} (${c.hex})`).join(', ') || 'Not specified'}\n- Typography: ${designTaste.typographyStyle}\n- Layout: ${designTaste.layoutStyle}\n- Graphics: ${designTaste.graphicStyle}\n- Tone: ${designTaste.contentToneAndLanguage}\n- Trends: ${designTaste.designTrendsDetected}`;
            const requirementsString = getRequirementsStringForPrompt(requirements);
            const brandingString = `- Logo Provided: ${requirements.logo ? 'Yes' : 'No'}\n- Brand Colors: ${requirements.colorPreferences || 'Adapt from taste'}\n- Mood/Theme: ${requirements.moodTheme || 'Infer from taste'}`;

            const prompt = `Act as a world-class Creative Director. Generate a detailed, premium-quality poster design brief for an advanced image generation AI.
---
**DESIGN DNA:**
${designTasteString}
---
**CORE REQUIREMENTS:**
${requirementsString}
---
**BRANDING & PREFERENCES:**
${brandingString}
---
**INSTRUCTIONS:**
Create a comprehensive brief with these sections: 
1. **Conceptual Core & Visual Narrative:** The big idea and emotional impact.
2. **Sophisticated Color Palette:** Refined color choices with HEX codes.
3. **Advanced Typography & Hierarchy:** Font pairing suggestions and clear order.
4. **Dynamic Layout & Composition (for ${requirements.aspectRatio} ratio):** Principles like Rule of Thirds.
5. **Compelling Imagery & Graphics:** Style and subject matter.
6. **Precise Text Content & Placement:** List all text from requirements and where it goes.
7. **Subtle Decorative Elements (Optional):** Finishing touches.

Output ONLY the brief. Be specific, creative, and ensure all text is grammatically flawless in ${requirements.languagePreference}.`;

            const response = await ai.models.generateContent({
                model: TEXT_GENERATION_MODEL,
                contents: prompt
            });

            return response.text;
        });
    } catch (error) {
        parseAndThrowApiError(error, 'poster concept generation');
    }
};

export const generatePosterImage = async (posterConcept: string, requirements: PosterRequirements): Promise<UploadedImage> => {
    try {
        return await withRetry(async () => {
            let styleKeywords = '';
            switch (requirements.imageStyle) {
                case 'Photorealistic': styleKeywords = 'ultra-realistic, 8k, detailed texture, sharp focus, professionally lit, DSLR photograph'; break;
                case 'Digital Illustration': styleKeywords = 'digital painting, intricate details, smooth gradients, vector art, vibrant colors, masterpiece'; break;
                case 'Cinematic': styleKeywords = 'cinematic lighting, dramatic shadows, wide-angle, anamorphic, moody, film grain, epic'; break;
                case 'Vintage/Retro': styleKeywords = 'vintage poster, retro aesthetic, 1970s color palette, aged paper texture, halftone print'; break;
                case 'Flat/Vector': styleKeywords = 'flat design, 2D vector art, clean shapes, bold colors, minimalist iconography'; break;
                default: styleKeywords = 'high quality, visually appealing, professional design';
            }

            const negativePrompt = 'ugly, distorted, blurry text, garbled text, misspelled words, incorrect grammar, distorted faces, extra limbs, misshapen, watermark, signature, artifacts, low quality';

            const imagePrompt = `Create an award-winning poster based on this brief.
**CRITICAL INSTRUCTIONS:**
1.  **TEXT ACCURACY:** Highest priority. All text on the poster MUST be grammatically perfect and spelled correctly in ${requirements.languagePreference}. Render text using clear, legible, stylistically appropriate fonts. Accurately transcribe all text from the brief. DO NOT invent, omit, or misplace text.
2.  **ASPECT RATIO:** Strictly adhere to a ${requirements.aspectRatio} aspect ratio.
3.  **ART DIRECTION:** Overall visual style: **${styleKeywords}**.
4.  **AVOID:** ${negativePrompt}.
5.  **ADHERENCE TO BRIEF:** Closely follow all stylistic and content instructions.

**DESIGN BRIEF TO IMPLEMENT:**
---
${posterConcept}
---`;

            const response = await ai.models.generateImages({
                model: IMAGE_GENERATION_MODEL,
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: requirements.aspectRatio,
                },
            });

            if (!response.generatedImages || response.generatedImages.length === 0) {
                throw new Error("Image generation failed to produce an image.");
            }
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const preview = `data:image/png;base64,${base64ImageBytes}`;
            
            const blob = await (await fetch(preview)).blob();
            const file = new File([blob], `${requirements.eventName || 'generated_poster'}.png`, { type: 'image/png' });

            return {
                file,
                preview,
                base64: base64ImageBytes,
                mimeType: 'image/png',
            };
        });
    } catch (error) {
        parseAndThrowApiError(error, 'image generation');
    }
};

export const editPosterImage = async (baseImage: UploadedImage, prompt: string, logo: UploadedImage | null): Promise<UploadedImage> => {
    try {
        return await withRetry(async () => {
            const parts: any[] = [
                { inlineData: { mimeType: baseImage.mimeType, data: baseImage.base64 } },
                { text: prompt },
            ];

            if (logo) {
                parts.push({ inlineData: { mimeType: logo.mimeType, data: logo.base64 } });
            }

            const response = await ai.models.generateContent({
                model: IMAGE_EDITING_MODEL,
                contents: { parts: parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);

            if (!imagePart || !imagePart.inlineData) {
                const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text)?.text;
                throw new Error(`Image editing failed. AI response: ${textPart || "No image was returned."}`);
            }

            const base64 = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            const preview = `data:${mimeType};base64,${base64}`;

            const blob = await (await fetch(preview)).blob();
            const file = new File([blob], `edited_poster.png`, { type: mimeType });

            return {
                file,
                preview,
                base64,
                mimeType,
            };
        });
    } catch (error) {
        parseAndThrowApiError(error, 'image editing');
    }
};