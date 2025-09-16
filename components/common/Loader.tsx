
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
    message: string;
    overlay?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ message, overlay = false }) => {
    if (overlay) {
        return (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
                <Loader2 className="animate-spin h-12 w-12 text-cyan-400" />
                <p className="text-slate-300 mt-4 text-base">{message}</p>
            </div>
        );
    }

    return (
        <div className="mt-8 text-center p-10 bg-slate-800/50 rounded-xl shadow-inner border border-slate-700">
            <Loader2 className="animate-spin h-16 w-16 text-cyan-500 mx-auto" />
            <p className="text-slate-300 mt-4 text-lg">{message}</p>
        </div>
    );
};
