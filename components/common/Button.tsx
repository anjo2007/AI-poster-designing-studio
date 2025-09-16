
import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

interface ButtonProps {
    onClick: () => void;
    children?: React.ReactNode;
    isLoading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: LucideIcon;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, isLoading = false, disabled = false, variant = 'primary', icon: IconCmp, className = "" }) => {
    const baseStyle = "flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105";
    let variantStyle = "";
    switch (variant) {
        case 'primary': variantStyle = "text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500"; break;
        case 'secondary': variantStyle = "text-cyan-700 bg-cyan-100 hover:bg-cyan-200 focus:ring-cyan-500 text-slate-800"; break;
        case 'danger': variantStyle = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"; break;
        default: variantStyle = "text-slate-200 bg-slate-600 hover:bg-slate-700 focus:ring-slate-500"; break;
    }
    return (
        <button type="button" onClick={onClick} disabled={isLoading || disabled} className={`${baseStyle} ${variantStyle} ${className}`}>
            {isLoading ? <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> : (IconCmp && <IconCmp className="-ml-1 mr-2 h-5 w-5" />)}
            {children}
        </button>
    );
};
