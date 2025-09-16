import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionProps {
    title: string;
    children: React.ReactNode;
    stepNumber: number;
    currentStep: number;
    icon: LucideIcon;
    onNavigate: (step: number) => void;
}

export const Section: React.FC<SectionProps> = ({ title, children, stepNumber, currentStep, icon: SectionIcon, onNavigate }) => {
    const isActive = stepNumber === currentStep;
    const isCompleted = stepNumber < currentStep;

    const headerClasses = "text-3xl font-bold text-slate-100 mb-6 flex items-center";
    const isNavigable = isCompleted;

    const HeaderContent = () => (
        <>
            <span className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 text-white transition-colors ${isActive ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                <SectionIcon size={20} />
            </span>
            {title}
        </>
    );

    return (
        <div className={`p-6 md:p-8 rounded-2xl shadow-lg mb-10 bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 ease-in-out ${isActive ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900' : (isCompleted ? 'opacity-60 hover:opacity-100' : 'opacity-40')}`}>
            {isNavigable ? (
                 <button onClick={() => onNavigate(stepNumber)} className={`${headerClasses} w-full text-left transition-opacity hover:opacity-80`}>
                    <HeaderContent />
                </button>
            ) : (
                <h2 className={headerClasses}>
                    <HeaderContent />
                </h2>
            )}
            
            <div className={`${!isActive ? 'hidden' : ''}`}>
                {children}
            </div>
        </div>
    );
};