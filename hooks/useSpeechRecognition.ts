
import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionAPI extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    // FIX: Add missing event handler properties to match API usage
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognitionAPI;
        webkitSpeechRecognition: new () => SpeechRecognitionAPI;
    }
}

export const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognitionAPI | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition not supported in this browser.");
            return;
        }
        
        const newRecognition = new SpeechRecognition();
        newRecognition.continuous = true;
        newRecognition.interimResults = true;
        newRecognition.lang = 'en-US';

        newRecognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setTranscript(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
            }
        };
        
        newRecognition.onerror = (event: any) => {
            setError(event.error);
            setIsListening(false);
        };
        
        newRecognition.onend = () => {
            setIsListening(false);
        };

        setRecognition(newRecognition);
    }, []);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            setTranscript(''); // Clear previous transcript
            recognition.start();
            setIsListening(true);
            setError(null);
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition, isListening]);
    
    return { transcript, isListening, startListening, stopListening, error, hasRecognitionSupport: !!recognition };
};
