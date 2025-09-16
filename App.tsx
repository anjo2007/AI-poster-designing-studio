import React, { useState, useCallback } from 'react';
import type { UploadedImage, DesignTaste, PosterRequirements, ApiMessage, LoadingStates } from './types';
import { initialPosterRequirements, initialDesignTaste } from './constants';
import * as geminiService from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MessageDisplay } from './components/MessageDisplay';
import { Step1Inspiration } from './components/Step1Inspiration';
import { Step2Requirements } from './components/Step2Requirements';
import { Step3Concept } from './components/Step3Concept';
import { Step4Finalize } from './components/Step4Finalize';

export default function App() {
    const [sampleImages, setSampleImages] = useState<UploadedImage[]>([]);
    const [designTaste, setDesignTaste] = useState<DesignTaste | null>(null);
    const [posterRequirements, setPosterRequirements] = useState<PosterRequirements>({ ...initialPosterRequirements });
    const [posterConcept, setPosterConcept] = useState<string>('');
    const [generatedPoster, setGeneratedPoster] = useState<UploadedImage | null>(null);
    const [loading, setLoading] = useState<LoadingStates>({ taste: false, concept: false, poster: false, edit: false });
    const [activeStep, setActiveStep] = useState<number>(1);
    const [message, setMessage] = useState<ApiMessage>({ type: '', text: '' });

    const handleStartOver = useCallback(() => {
        setSampleImages([]);
        setDesignTaste(null);
        setPosterRequirements({ ...initialPosterRequirements });
        setPosterConcept('');
        setGeneratedPoster(null);
        setActiveStep(1);
        setMessage({ type: 'info', text: 'App reset. Start fresh!' });
        sampleImages.forEach(img => URL.revokeObjectURL(img.preview));
        if (posterRequirements.logo) {
            URL.revokeObjectURL(posterRequirements.logo.preview);
        }
    }, [sampleImages, posterRequirements.logo]);

     const handleRequirementChange = useCallback((field: keyof PosterRequirements, value: any) => {
        setPosterRequirements(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleStepNavigation = useCallback((step: number) => {
        if (step < activeStep) {
            setActiveStep(step);
        }
    }, [activeStep]);

    const analyzeDesignTaste = useCallback(async () => {
        setLoading(prev => ({ ...prev, taste: true }));
        setDesignTaste(null);
        setMessage({ type: 'info', text: 'Analyzing design taste... This may take a few moments.' });
        try {
            const taste = await geminiService.analyzeDesignTaste(sampleImages);
            setDesignTaste({ ...initialDesignTaste, ...taste });
            setMessage({ type: 'success', text: 'Design taste analyzed! You can now edit the details below or proceed.' });
            setActiveStep(2);
        } catch (error) {
            console.error("Failed to analyze design taste:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessage({ type: 'error', text: `Failed to analyze design taste: ${errorMessage}` });
        } finally {
            setLoading(prev => ({ ...prev, taste: false }));
        }
    }, [sampleImages]);

    const generatePosterConcept = useCallback(async () => {
        if (!designTaste) {
            setMessage({ type: 'error', text: 'Please analyze or define design taste first.' });
            return;
        }
        setLoading(prev => ({ ...prev, concept: true }));
        setMessage({ type: 'info', text: 'Generating premium poster concept...' });
        try {
            const concept = await geminiService.generatePosterConcept(designTaste, posterRequirements);
            setPosterConcept(concept);
            setMessage({ type: 'success', text: 'Premium poster concept generated! You can edit it below.' });
            setActiveStep(3);
        } catch (error) {
            console.error("Failed to generate poster concept:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessage({ type: 'error', text: `Failed to generate concept: ${errorMessage}` });
        } finally {
            setLoading(prev => ({ ...prev, concept: false }));
        }
    }, [designTaste, posterRequirements]);

    const generatePosterImage = useCallback(async () => {
        if (!posterConcept.trim()) {
            setMessage({ type: 'error', text: 'Generate or write a concept first.' });
            return;
        }
        setLoading(prev => ({ ...prev, poster: true }));
        setGeneratedPoster(null);
        setMessage({ type: 'info', text: 'Generating premium poster image... This may take some time.' });
        try {
            const image = await geminiService.generatePosterImage(posterConcept, posterRequirements);
            setGeneratedPoster(image);
            setMessage({ type: 'success', text: 'Premium poster image generated!' });
            setActiveStep(4);
        } catch (error) {
            console.error("Failed to generate poster image:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessage({ type: 'error', text: `Image generation failed: ${errorMessage}` });
        } finally {
            setLoading(prev => ({ ...prev, poster: false }));
        }
    }, [posterConcept, posterRequirements]);

    const editPoster = useCallback(async (editPrompt: string, useLogo: boolean) => {
        if (!generatedPoster) {
            setMessage({ type: 'error', text: 'Generate a poster before editing.' });
            return;
        }
        if (useLogo && !posterRequirements.logo) {
            setMessage({ type: 'error', text: 'Upload a logo in Step 2 to add it.' });
            return;
        }

        setLoading(prev => ({ ...prev, edit: true }));
        setMessage({ type: 'info', text: 'Applying edits to your poster...' });

        const finalPrompt = useLogo
            ? `Please place the provided logo onto the poster image. Position it tastefully, for example in a corner, ensuring it is legible and integrates well with the overall design. ${editPrompt}`.trim()
            : editPrompt;

        try {
            const editedImage = await geminiService.editPosterImage(generatedPoster, finalPrompt, useLogo ? posterRequirements.logo : null);
            setGeneratedPoster(editedImage);
            setMessage({ type: 'success', text: 'Poster successfully edited!' });
        } catch (error) {
            console.error("Failed to edit poster:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessage({ type: 'error', text: `Failed to edit poster: ${errorMessage}` });
        } finally {
            setLoading(prev => ({ ...prev, edit: false }));
        }
    }, [generatedPoster, posterRequirements.logo]);

    return (
        <div className="min-h-screen bg-slate-900 p-4 sm:p-8 font-sans text-slate-100 transition-all duration-1000 ease-in-out">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute w-[40vmax] h-[40vmax] rounded-full bg-cyan-500/20 blur-3xl animate-blob-1"></div>
                <div className="absolute w-[30vmax] h-[30vmax] rounded-full bg-purple-500/20 blur-3xl animate-blob-2"></div>
                <div className="absolute w-[35vmax] h-[35vmax] rounded-full bg-sky-500/20 blur-3xl animate-blob-3"></div>
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
                <Header onStartOver={handleStartOver} />
                <MessageDisplay message={message} />

                <main>
                    <Step1Inspiration
                        currentStep={activeStep}
                        sampleImages={sampleImages}
                        setSampleImages={setSampleImages}
                        analyzeDesignTaste={analyzeDesignTaste}
                        isLoading={loading.taste}
                        onNavigate={handleStepNavigation}
                    />

                    <Step2Requirements
                        currentStep={activeStep}
                        designTaste={designTaste}
                        setDesignTaste={setDesignTaste}
                        posterRequirements={posterRequirements}
                        handleRequirementChange={handleRequirementChange}
                        generatePosterConcept={generatePosterConcept}
                        isLoading={loading.concept}
                        setMessage={setMessage}
                        onNavigate={handleStepNavigation}
                    />

                    <Step3Concept
                        currentStep={activeStep}
                        posterConcept={posterConcept}
                        setPosterConcept={setPosterConcept}
                        generatePosterConcept={generatePosterConcept}
                        generatePosterImage={generatePosterImage}
                        isLoadingConcept={loading.concept}
                        isLoadingPoster={loading.poster}
                        onNavigate={handleStepNavigation}
                    />

                    <Step4Finalize
                        currentStep={activeStep}
                        generatedPoster={generatedPoster}
                        editPoster={editPoster}
                        generatePosterImage={generatePosterImage}
                        isLoadingEdit={loading.edit}
                        isLoadingPoster={loading.poster}
                        posterName={posterRequirements.eventName}
                        onNavigate={handleStepNavigation}
                    />
                </main>
                <Footer />
            </div>
        </div>
    );
}