import React from 'react';
import { ImageIcon, RefreshCw, Wand2 } from 'lucide-react';
import { Section } from './Section';
import { Button } from './common/Button';

interface Step3Props {
    currentStep: number;
    posterConcept: string;
    setPosterConcept: React.Dispatch<React.SetStateAction<string>>;
    generatePosterConcept: () => void;
    generatePosterImage: () => void;
    isLoadingConcept: boolean;
    isLoadingPoster: boolean;
    onNavigate: (step: number) => void;
}

export const Step3Concept: React.FC<Step3Props> = ({ currentStep, posterConcept, setPosterConcept, generatePosterConcept, generatePosterImage, isLoadingConcept, isLoadingPoster, onNavigate }) => {

    return (
        <Section title="Step 3: Review Concept & Generate Poster" stepNumber={3} currentStep={currentStep} icon={ImageIcon} onNavigate={onNavigate}>
            <div className="mb-8 p-6 bg-cyan-900/20 rounded-xl shadow-inner border border-cyan-500/30">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-cyan-300">AI Generated Poster Concept (Editable):</h3>
                    <Button onClick={generatePosterConcept} isLoading={isLoadingConcept} icon={RefreshCw} variant="secondary">Regenerate Concept</Button>
                </div>
                <textarea value={posterConcept} onChange={(e) => setPosterConcept(e.target.value)} rows={18} className="text-slate-200 bg-slate-800 w-full p-4 text-sm rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Poster concept..."/>
            </div>
            <div className="mt-8 flex justify-end">
                <Button onClick={generatePosterImage} isLoading={isLoadingPoster} disabled={!posterConcept.trim()} icon={Wand2}>Generate Poster Image</Button>
            </div>
        </Section>
    );
};