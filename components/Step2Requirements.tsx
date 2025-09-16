import React, { useEffect } from 'react';
import { Edit3, FileText, PlusCircle, Trash2 } from 'lucide-react';
import type { DesignTaste, PosterRequirements, ApiMessage, Color, UploadedImage } from '../types';
import { processFiles } from '../utils/fileUtils';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Section } from './Section';
import { Button } from './common/Button';
import { FileInput } from './common/FileInput';
import { SelectInput } from './common/SelectInput';
import { SpeechTextArea } from './common/SpeechTextArea';
import { TextInput } from './common/TextInput';

interface Step2Props {
    currentStep: number;
    designTaste: DesignTaste | null;
    setDesignTaste: React.Dispatch<React.SetStateAction<DesignTaste | null>>;
    posterRequirements: PosterRequirements;
    handleRequirementChange: (field: keyof PosterRequirements, value: string | UploadedImage | null) => void;
    generatePosterConcept: () => void;
    isLoading: boolean;
    setMessage: React.Dispatch<React.SetStateAction<ApiMessage>>;
    onNavigate: (step: number) => void;
}

const EditableDesignTaste: React.FC<Pick<Step2Props, 'designTaste' | 'setDesignTaste' | 'setMessage'>> = ({ designTaste, setDesignTaste, setMessage }) => {
    const [newColor, setNewColor] = React.useState({ name: '', hex: '' });
    if (!designTaste) return null;

    const handleTasteChange = (field: keyof DesignTaste, value: string) => {
        setDesignTaste(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handlePaletteChange = (index: number, key: keyof Color, value: string) => {
        setDesignTaste(prev => {
            if (!prev) return null;
            const newPalette = [...prev.colorPalette];
            newPalette[index] = { ...newPalette[index], [key]: value };
            return { ...prev, colorPalette: newPalette };
        });
    };

    const addColor = () => {
        if (!/^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(newColor.hex)) {
            setMessage({ type: 'error', text: 'Invalid HEX color format.' });
            return;
        }
        setDesignTaste(prev => prev ? { ...prev, colorPalette: [...prev.colorPalette, newColor] } : null);
        setNewColor({ name: '', hex: '' });
    };

    const removeColor = (index: number) => {
        setDesignTaste(prev => prev ? { ...prev, colorPalette: prev.colorPalette.filter((_, i) => i !== index) } : null);
    };

    return (
        <div className="mb-8 p-6 bg-slate-800/50 rounded-xl shadow-inner border border-slate-700">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">AI Analyzed Design Taste (Editable)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Color Palette:</label>
                    <div className="space-y-2">
                        {designTaste.colorPalette.map((color, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div style={{ backgroundColor: color.hex }} className="w-6 h-6 rounded-md border border-slate-500 shrink-0"></div>
                                <input type="text" value={color.name} onChange={e => handlePaletteChange(index, 'name', e.target.value)} placeholder="Color Name" className="bg-slate-700 text-white w-full px-2 py-1 border border-slate-600 rounded text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                                <input type="text" value={color.hex} onChange={e => handlePaletteChange(index, 'hex', e.target.value)} placeholder="#HEX" className="bg-slate-700 text-white w-28 px-2 py-1 border border-slate-600 rounded text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                                <Button onClick={() => removeColor(index)} variant="danger" className="!p-2"><Trash2 size={16}/></Button>
                            </div>
                        ))}
                        <div className="flex items-center space-x-2 pt-2">
                            <div className="w-6 h-6 rounded-md border border-dashed border-slate-500 shrink-0"></div>
                            <input type="text" value={newColor.name} onChange={e => setNewColor(c => ({...c, name: e.target.value}))} placeholder="New Color Name" className="bg-slate-700 text-white w-full px-2 py-1 border border-slate-600 rounded text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                            <input type="text" value={newColor.hex} onChange={e => setNewColor(c => ({...c, hex: e.target.value}))} placeholder="#HEX" className="bg-slate-700 text-white w-28 px-2 py-1 border border-slate-600 rounded text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                            <Button onClick={addColor} variant="secondary" className="!p-2"><PlusCircle size={16}/></Button>
                        </div>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Typography Style</label>
                    <input type="text" value={designTaste.typographyStyle} onChange={e => handleTasteChange('typographyStyle', e.target.value)} className="bg-slate-700 text-white w-full px-3 py-2 border border-slate-600 rounded text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                    <label className="block text-sm font-medium text-slate-400 mb-1 mt-2">Layout Style</label>
                    <input type="text" value={designTaste.layoutStyle} onChange={e => handleTasteChange('layoutStyle', e.target.value)} className="bg-slate-700 text-white w-full px-3 py-2 border border-slate-600 rounded text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                    <label className="block text-sm font-medium text-slate-400 mb-1 mt-2">Graphic Style</label>
                    <input type="text" value={designTaste.graphicStyle} onChange={e => handleTasteChange('graphicStyle', e.target.value)} className="bg-slate-700 text-white w-full px-3 py-2 border border-slate-600 rounded text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
            </div>
        </div>
    );
}

export const Step2Requirements: React.FC<Step2Props> = (props) => {
    const { currentStep, designTaste, posterRequirements, handleRequirementChange, generatePosterConcept, isLoading, onNavigate } = props;
    const { transcript: descTranscript, startListening: startDesc, stopListening: stopDesc, isListening: isDescListening } = useSpeechRecognition();
    const { transcript: ctaTranscript, startListening: startCta, stopListening: stopCta, isListening: isCtaListening } = useSpeechRecognition();

    useEffect(() => {
        if (descTranscript) handleRequirementChange('description', descTranscript);
    }, [descTranscript, handleRequirementChange]);
    
    useEffect(() => {
        if (ctaTranscript) handleRequirementChange('callToAction', ctaTranscript);
    }, [ctaTranscript, handleRequirementChange]);
    
    const onFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        handleRequirementChange(e.target.name as keyof PosterRequirements, e.target.value);
    };
    
    const onLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];
        if (file) {
            if (posterRequirements.logo) URL.revokeObjectURL(posterRequirements.logo.preview);
            const [processedFile] = await processFiles([file]);
            handleRequirementChange('logo', processedFile);
        } else {
            handleRequirementChange('logo', null);
        }
    };

    const getEventNameLabel = () => {
        switch (posterRequirements.posterType) {
            case 'Festival Greetings': return "Festival Name";
            case 'Product Advertisement': return "Product Name";
            case 'Movie Poster': return "Movie Title";
            case 'Social Cause/Awareness': return "Cause/Campaign Title";
            default: return "Event/Topic Name";
        }
    };
    const getDateTimeLabel = () => posterRequirements.posterType === 'Movie Poster' ? "Release Date" : "Date & Time";

    return (
        <Section title="Step 2: Define Your Poster Requirements" stepNumber={2} currentStep={currentStep} icon={Edit3} onNavigate={onNavigate}>
            <EditableDesignTaste {...props} />
            <h3 className="text-xl font-semibold text-slate-200 mb-4 mt-8 pt-6 border-t border-slate-700">Poster Specifics:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <SelectInput id="posterType" name="posterType" label="Poster Type" value={posterRequirements.posterType} onChange={onFormChange}
                    options={[ 'Event Promotion', 'Music Concert', 'Festival Greetings', 'Product Advertisement', 'Movie Poster', 'Social Cause/Awareness', 'Informational', 'Other' ]}
                />
                <TextInput id="eventName" name="eventName" label={getEventNameLabel()} value={posterRequirements.eventName} onChange={onFormChange} placeholder="e.g., Summer Fest, EcoSaver Pro"/>
                
                {['Event Promotion', 'Music Concert', 'Movie Poster', 'Informational'].includes(posterRequirements.posterType) &&
                    <TextInput id="dateTime" name="dateTime" label={getDateTimeLabel()} value={posterRequirements.dateTime} onChange={onFormChange} placeholder="e.g., July 20, 2025, 7 PM"/>
                }
                {['Event Promotion', 'Music Concert', 'Informational'].includes(posterRequirements.posterType) &&
                    <TextInput id="venue" name="venue" label="Venue/Location" value={posterRequirements.venue} onChange={onFormChange} placeholder="e.g., City Park Amphitheater"/>
                }
                {posterRequirements.posterType === 'Festival Greetings' && 
                    <TextInput id="specificGreeting" name="specificGreeting" label="Specific Greeting" value={posterRequirements.specificGreeting} onChange={onFormChange} placeholder="e.g., Wishing you joy and light!"/>
                }
                {posterRequirements.posterType === 'Product Advertisement' && (<>
                    <TextInput id="brandName" name="brandName" label="Brand Name" value={posterRequirements.brandName} onChange={onFormChange} placeholder="e.g., Aura Cosmetics"/>
                    <TextInput id="slogan" name="slogan" label="Slogan/Tagline" value={posterRequirements.slogan} onChange={onFormChange} placeholder="e.g., Naturally You."/>
                </>)}
                {posterRequirements.posterType === 'Movie Poster' && (<>
                    <TextInput id="starring" name="starring" label="Starring" value={posterRequirements.starring} onChange={onFormChange} placeholder="e.g., Actor A, Actress B"/>
                    <TextInput id="director" name="director" label="Director" value={posterRequirements.director} onChange={onFormChange} placeholder="e.g., Director X"/>
                </>)}
                 {posterRequirements.posterType === 'Social Cause/Awareness' && 
                    <TextInput id="campaignGoal" name="campaignGoal" label="Campaign Goal" value={posterRequirements.campaignGoal} onChange={onFormChange} placeholder="e.g., Reduce plastic use"/>
                }
            </div>

            <SpeechTextArea
                id="description" name="description" label="General Description / Additional Details*" value={posterRequirements.description}
                onChange={(e) => handleRequirementChange('description', e.target.value)} placeholder="Provide overall context, key information, or specific instructions. You can also use the microphone to dictate."
                isListening={isDescListening} startListening={startDesc} stopListening={stopDesc}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <SpeechTextArea
                    id="callToAction" name="callToAction" label="Call to Action / Main Tagline" value={posterRequirements.callToAction}
                    onChange={(e) => handleRequirementChange('callToAction', e.target.value)} placeholder="e.g., Buy Tickets Now!, Happy Diwali!" rows={1}
                    isListening={isCtaListening} startListening={startCta} stopListening={stopCta}
                />
                 <SelectInput id="languagePreference" name="languagePreference" label="Primary Language" value={posterRequirements.languagePreference} onChange={onFormChange}
                    options={['English', 'Spanish', 'French', 'German', 'Malayalam', 'Hindi', 'Other']}
                />
                <SelectInput id="imageStyle" name="imageStyle" label="Image Generation Style" value={posterRequirements.imageStyle} onChange={onFormChange}
                    options={[ {value: 'Default', label:'Default High Quality'}, 'Photorealistic', 'Digital Illustration', 'Cinematic', 'Vintage/Retro', {value: 'Flat/Vector', label: 'Flat/Vector Graphic'} ]}
                />
                <SelectInput id="aspectRatio" name="aspectRatio" label="Poster Aspect Ratio" value={posterRequirements.aspectRatio} onChange={onFormChange}
                    options={[
                        { value: '3:4', label: 'Portrait (3:4) - Standard' }, { value: '9:16', label: 'Portrait (9:16) - Story' },
                        { value: '16:9', label: 'Landscape (16:9) - Slide' }, { value: '4:3', label: 'Landscape (4:3) - Photo' },
                        { value: '1:1', label: 'Square (1:1) - Post' }
                    ]}
                />
                <TextInput id="moodTheme" name="moodTheme" label="Desired Mood/Theme" value={posterRequirements.moodTheme} onChange={onFormChange} placeholder="e.g., Youthful, Elegant, Festive" />
                <TextInput id="colorPreferences" name="colorPreferences" label="Specific Color Preferences" value={posterRequirements.colorPreferences} onChange={onFormChange} placeholder="e.g., #FF0000, Blue tones" />
            </div>
            
            <FileInput id="logo" label="Upload Logo (Optional)" onChange={onLogoUpload} currentFile={posterRequirements.logo} />
            
            <div className="mt-8 flex justify-end">
                <Button onClick={generatePosterConcept} isLoading={isLoading} disabled={!designTaste || !posterRequirements.description.trim()} icon={FileText}>Generate Poster Concept</Button>
            </div>
        </Section>
    );
};