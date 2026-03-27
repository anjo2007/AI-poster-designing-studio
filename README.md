# AI Poster Design Studio

Craft stunning, personalized posters effortlessly. Upload inspiration images, define your needs, and let the AI design and edit a masterpiece for you — using voice or text.

## Features

- **Design Taste Analysis** – Upload reference images to let the AI learn your visual style.
- **Poster Requirements** – Specify event name, tagline, color palette, dimensions, and more.
- **Concept Generation** – Get a detailed design concept crafted by AI that you can review and edit.
- **Image Generation** – Instantly generate a high-quality poster image from your concept.
- **AI-Powered Editing** – Refine the generated poster with text or voice instructions, including logo placement.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for development and builds
- [Gemini API](https://ai.google.dev/) (`@google/genai`) for AI features
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the project root and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

## How It Works

1. **Step 1 – Inspiration:** Upload one or more reference images. The AI analyzes them to detect your design taste (color palette, typography style, mood, etc.).
2. **Step 2 – Requirements:** Review the detected design taste and fill in poster-specific details such as event name, tagline, and logo.
3. **Step 3 – Concept:** Generate and refine a written design concept that will guide image generation.
4. **Step 4 – Finalize:** Generate the poster image and make final edits with AI assistance.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
