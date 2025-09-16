
import React from 'react';

interface SelectInputProps {
    id: string;
    name: string;
    label: string;
    value: string | number;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    options: (string | { value: string; label: string })[];
}

export const SelectInput: React.FC<SelectInputProps> = ({ id, name, label, value, onChange, options }) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <select id={id} name={name} value={value} onChange={onChange} className="text-white mt-1 block w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition appearance-none bg-no-repeat bg-right pr-8"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
        }}>
            {options.map(opt => {
                const val = typeof opt === 'string' ? opt : opt.value;
                const label = typeof opt === 'string' ? opt : opt.label;
                return <option key={val} value={val}>{label}</option>
            })}
        </select>
    </div>
);
