
export interface UploadedImage {
    file: File;
    preview: string;
    base64: string;
    mimeType: string;
}

export interface Color {
    name: string;
    hex: string;
}

export interface DesignTaste {
    colorPalette: Color[];
    typographyStyle: string;
    layoutStyle: string;
    graphicStyle: string;
    contentToneAndLanguage: string;
    designTrendsDetected: string;
}

export interface PosterRequirements {
    posterType: string;
    eventName: string;
    dateTime: string;
    venue: string;
    description: string;
    callToAction: string;
    languagePreference: string;
    logo: UploadedImage | null;
    colorPreferences: string;
    moodTheme: string;
    aspectRatio: '1:1' | '9:16' | '16:9' | '4:3' | '3:4';
    imageStyle: string;
    specificGreeting: string;
    brandName: string;
    slogan: string;
    starring: string;
    director: string;
    campaignGoal: string;
}

export interface ApiMessage {
    type: 'error' | 'success' | 'info' | '';
    text: string;
}

export interface LoadingStates {
    taste: boolean;
    concept: boolean;
    poster: boolean;
    edit: boolean;
}
