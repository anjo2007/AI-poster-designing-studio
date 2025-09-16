
import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { ApiMessage } from '../types';

interface MessageDisplayProps {
    message: ApiMessage;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
    if (!message.text) return null;

    let bgColor, textColor, IconCmp;
    switch (message.type) {
        case 'error':
            bgColor = 'bg-red-900/50 border-red-500/50';
            textColor = 'text-red-200';
            IconCmp = AlertTriangle;
            break;
        case 'success':
            bgColor = 'bg-green-900/50 border-green-500/50';
            textColor = 'text-green-200';
            IconCmp = CheckCircle;
            break;
        case 'info':
        default:
            bgColor = 'bg-blue-900/50 border-blue-500/50';
            textColor = 'text-blue-200';
            IconCmp = Info;
            break;
    }

    return (
        <div className={`p-4 rounded-lg border ${bgColor} ${textColor} flex items-start space-x-3 my-6 shadow-lg backdrop-blur-sm`}>
            <IconCmp size={20} className="flex-shrink-0 mt-0.5" />
            <span className="flex-grow text-sm font-medium">{message.text}</span>
        </div>
    );
};
