
import type { PosterRequirements, DesignTaste } from './types';

export const MAX_SAMPLE_IMAGES = 4;

// Model Names
export const TEXT_GENERATION_MODEL = "gemini-2.5-flash";
export const IMAGE_GENERATION_MODEL = "imagen-4.0-generate-001";
export const IMAGE_EDITING_MODEL = "gemini-2.5-flash-image-preview";

// Initial States
export const initialPosterRequirements: PosterRequirements = {
    posterType: 'Event Promotion',
    eventName: '',
    dateTime: '',
    venue: '',
    description: '',
    callToAction: '',
    languagePreference: 'English',
    logo: null,
    colorPreferences: '',
    moodTheme: '',
    aspectRatio: '3:4',
    imageStyle: 'Default',
    specificGreeting: '',
    brandName: '',
    slogan: '',
    starring: '',
    director: '',
    campaignGoal: '',
};

export const initialDesignTaste: DesignTaste = {
    colorPalette: [],
    typographyStyle: "N/A",
    layoutStyle: "N/A",
    graphicStyle: "N/A",
    contentToneAndLanguage: "N/A",
    designTrendsDetected: "N/A"
};
