
import type { UploadedImage } from '../types';

export const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as string.'));
        }
    };
    reader.onerror = error => reject(error);
});


export const processFiles = async (files: File[]): Promise<UploadedImage[]> => {
    const imagePromises = files.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const base64 = await toBase64(file);
        return { file, preview, base64, mimeType: file.type };
    });
    return Promise.all(imagePromises);
};
