import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, id, name, value, onChange, placeholder, type = "text" }) => {
    return (
        <div className="mb-6">
            <label htmlFor={id || name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <input
                type={type}
                id={id || name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="text-white mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition"
            />
        </div>
    );
};