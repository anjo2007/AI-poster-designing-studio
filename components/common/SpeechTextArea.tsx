
import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface SpeechTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    isListening: boolean;
    startListening: () => void;
    stopListening: () => void;
}

export const SpeechTextArea: React.FC<SpeechTextAreaProps> = ({ label, id, name, value, onChange, placeholder, rows = 3, isListening, startListening, stopListening }) => {
    return (
        <div className="mb-6">
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <div className="relative">
                <textarea
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    placeholder={placeholder}
                    className="text-slate-200 mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition pr-10"
                />
                <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    title={isListening ? 'Stop Listening' : 'Start Listening'}
                >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
            </div>
        </div>
    );
};
