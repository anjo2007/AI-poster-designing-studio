
import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from './common/Button';

interface HeaderProps {
    onStartOver: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartOver }) => {
    return (
        <header className="text-center my-12">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 py-3">AI Poster Design Studio</h1>
            <p className="text-slate-400 mt-4 text-lg sm:text-xl max-w-3xl mx-auto">Craft, refine, and perfect stunning posters effortlessly. Use voice or text to guide our AI from initial concept to final masterpiece.</p>
            <Button onClick={onStartOver} variant="secondary" icon={RotateCcw} className="mt-8 mx-auto !bg-slate-700/50 !text-slate-300 hover:!bg-slate-700 focus:!ring-slate-500 backdrop-blur-sm">Start Over / Reset All</Button>
        </header>
    );
};
