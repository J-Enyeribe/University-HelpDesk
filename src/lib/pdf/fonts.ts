import { Font } from '@react-pdf/renderer';
import path from 'path';

// Register fonts for React-PDF
// Note: In production, you'd want to use actual font files
// For now, we'll use the built-in Helvetica and register custom fonts if available

export function registerFonts(): void {
  // Register Poppins for headings (if font files exist)
  try {
    Font.register({
      family: 'Poppins',
      fonts: [
        { src: path.join(process.cwd(), 'public/fonts/Poppins-Regular.ttf'), fontWeight: 400 },
        { src: path.join(process.cwd(), 'public/fonts/Poppins-Medium.ttf'), fontWeight: 500 },
        { src: path.join(process.cwd(), 'public/fonts/Poppins-SemiBold.ttf'), fontWeight: 600 },
        { src: path.join(process.cwd(), 'public/fonts/Poppins-Bold.ttf'), fontWeight: 700 },
      ],
    });
  } catch {
    // Font files not found, will use Helvetica fallback
  }

  // Register Lato for body (if font files exist)
  try {
    Font.register({
      family: 'Lato',
      fonts: [
        { src: path.join(process.cwd(), 'public/fonts/Lato-Regular.ttf'), fontWeight: 400 },
        { src: path.join(process.cwd(), 'public/fonts/Lato-Bold.ttf'), fontWeight: 700 },
      ],
    });
  } catch {
    // Font files not found, will use Helvetica fallback
  }

  // Register JetBrains Mono for code/IDs
  try {
    Font.register({
      family: 'JetBrains Mono',
      fonts: [
        { src: path.join(process.cwd(), 'public/fonts/JetBrainsMono-Regular.ttf'), fontWeight: 400 },
        { src: path.join(process.cwd(), 'public/fonts/JetBrainsMono-Medium.ttf'), fontWeight: 500 },
      ],
    });
  } catch {
    // Font files not found, will use Courier fallback
  }
}

export const pdfFonts = {
  heading: 'Poppins',
  body: 'Lato',
  mono: 'JetBrains Mono',
  fallback: 'Helvetica',
};