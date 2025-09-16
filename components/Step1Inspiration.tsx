import React from 'react';
import { UploadCloud, Palette } from 'lucide-react';
import type { UploadedImage } from '../types';
import { MAX_SAMPLE_IMAGES } from '../constants';
import { processFiles } from '../utils/fileUtils';
import { Section } from './Section';
import { FileInput } from './common/FileInput';
import { Button } from './common/Button';

interface Step1Props {
    currentStep: number;
    sampleImages: UploadedImage[];
    setSampleImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
    analyzeDesignTaste: () => void;
    isLoading: boolean;
    onNavigate: (step: number) => void;
}

export const Step1Inspiration: React.FC<Step1Props> = ({ currentStep, sampleImages, setSampleImages, analyzeDesignTaste, isLoading, onNavigate }) => {
    
    const handleSampleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            sampleImages.forEach(img => URL.revokeObjectURL(img.preview));
            const newImages = await processFiles(files);
            setSampleImages(newImages);
        }
    };
    
    return (
        <Section title="Step 1: Upload Your Design Inspiration" stepNumber={1} currentStep={currentStep} icon={UploadCloud} onNavigate={onNavigate}>
            <p className="text-base text-slate-400 mb-4">Upload {MAX_SAMPLE_IMAGES} poster images that reflect your design taste. This helps our AI understand your aesthetic for color, typography, layout, and overall style.</p>
            <FileInput id="sampleImages" label={`Select ${MAX_SAMPLE_IMAGES} Images`} onChange={handleSampleImageUpload} multiple={true} fileCount={sampleImages.length} requiredCount={MAX_SAMPLE_IMAGES} />
            {sampleImages.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {sampleImages.map((img, index) => (
                        <div key={index} className="relative group aspect-w-1 aspect-h-1">
                            <img src={img.preview} alt={`Sample ${index + 1}`} className="w-full h-56 object-cover rounded-lg shadow-lg border-2 border-slate-700 group-hover:opacity-80 transition-opacity" />
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-8 flex justify-end">
                <Button onClick={analyzeDesignTaste} isLoading={isLoading} disabled={sampleImages.length !== MAX_SAMPLE_IMAGES} icon={Palette}>Analyze Design Taste</Button>
            </div>
        </Section>
    );
};