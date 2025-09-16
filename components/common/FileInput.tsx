
import React from 'react';
import type { UploadedImage } from '../../types';

interface FileInputProps {
    id: string;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    multiple?: boolean;
    accept?: string;
    currentFile?: UploadedImage | null;
    fileCount?: number;
    requiredCount?: number;
}

export const FileInput: React.FC<FileInputProps> = ({ id, label, onChange, multiple = false, accept = "image/*", currentFile, fileCount, requiredCount }) => {
    const countStatus = requiredCount ? `(${fileCount}/${requiredCount})` : '';
    const isMet = requiredCount && fileCount === requiredCount;

    return (
        <div className="mb-6">
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
                {label} <span className={`font-mono ${isMet ? 'text-green-400' : 'text-amber-400'}`}>{countStatus}</span>
            </label>
            <div className="relative">
                <input type="file" id={id} multiple={multiple} accept={accept} onChange={onChange} className="text-slate-300 block w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-300 hover:file:bg-cyan-500/20 cursor-pointer ring-1 ring-inset ring-slate-600 focus-within:ring-2 focus-within:ring-cyan-500 transition"/>
            </div>
            {currentFile && <img src={currentFile.preview} alt="Preview" className="mt-3 h-24 w-24 object-cover rounded-lg shadow-md border border-slate-700"/>}
        </div>
    );
};
