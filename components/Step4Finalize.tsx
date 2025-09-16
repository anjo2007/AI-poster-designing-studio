import React, { useState } from 'react';
import { CheckCircle, Download, ImagePlus, RefreshCw } from 'lucide-react';
import type { UploadedImage } from '../types';
import { Section } from './Section';
import { Button } from './common/Button';
import { SpeechTextArea } from './common/SpeechTextArea';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Loader } from './common/Loader';

interface Step4Props {
    currentStep: number;
    generatedPoster: UploadedImage | null;
    editPoster: (prompt: string, useLogo: boolean) => void;
    generatePosterImage: () => void;
    isLoadingEdit: boolean;
    isLoadingPoster: boolean;
    posterName: string;
    onNavigate: (step: number) => void;
}

export const Step4Finalize: React.FC<Step4Props> = ({ currentStep, generatedPoster, editPoster, generatePosterImage, isLoadingEdit, isLoadingPoster, posterName, onNavigate }) => {
    const [editPrompt, setEditPrompt] = useState('');
    const { transcript, startListening, stopListening, isListening } = useSpeechRecognition();

    React.useEffect(() => {
        if(transcript) setEditPrompt(transcript);
    }, [transcript]);

    const handleDownload = () => {
        if (!generatedPoster) return;
        const link = document.createElement('a');
        link.href = generatedPoster.preview;
        link.download = `${posterName.replace(/\s+/g, '_') || 'ai_poster'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Section title="Step 4: Finalize & Edit Your Poster" stepNumber={4} currentStep={currentStep} icon={CheckCircle} onNavigate={onNavigate}>
            {isLoadingPoster && <Loader message="AI is crafting your masterpiece... This can take up to a minute." />}
            
            {generatedPoster && !isLoadingPoster && (
                <div className="mt-4 p-6 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700">
                    <h3 className="text-2xl font-semibold text-white mb-6 text-center">Your AI Generated Poster!</h3>
                    <div className="flex justify-center mb-6 relative">
                        {isLoadingEdit && <Loader message="Applying your edits..." overlay={true} />}
                        <img src={generatedPoster.preview} alt="Generated Poster" className="max-w-full md:max-w-md lg:max-w-lg mx-auto rounded-lg shadow-xl border-4 border-cyan-500" />
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <h4 className="text-xl font-semibold text-cyan-400 mb-4">Advanced Editing</h4>
                        <p className="text-slate-400 mb-4 text-sm">Use simple commands to modify your poster. Correct text, change colors, or add elements. You can also dictate your edits using the microphone.</p>
                        <SpeechTextArea
                            id="editPrompt" name="editPrompt" label="Editing Instructions" value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)} placeholder="e.g., 'Change the background to a deep blue', 'Make the main title text larger and gold', 'Correct the date to say July 25th'"
                            isListening={isListening} startListening={startListening} stopListening={stopListening}
                        />
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                             <Button onClick={() => editPoster(editPrompt, false)} isLoading={isLoadingEdit} disabled={!editPrompt.trim()} variant="secondary">Apply Edit</Button>
                             <Button onClick={() => editPoster(editPrompt, true)} isLoading={isLoadingEdit} icon={ImagePlus}>Add Logo & Edit</Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pt-6 border-t border-slate-700">
                        <Button onClick={handleDownload} icon={Download} variant="secondary" className="w-full sm:w-auto">Download Poster</Button>
                        <Button onClick={generatePosterImage} isLoading={isLoadingPoster} icon={RefreshCw} variant="primary" className="w-full sm:w-auto">Regenerate Image</Button>
                    </div>
                </div>
            )}
        </Section>
    );
};