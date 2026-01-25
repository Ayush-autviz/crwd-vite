import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to truncate description at first period (character-based)
export const truncateAtFirstPeriod = (
  text: string,
  minChars = 50,
  maxChars = 100
): string => {
  if (!text) return text;

  // If text is already short
  if (text.length <= minChars) {
    return text;
  }

  // Limit search range to maxChars
  const limitedText = text.slice(0, maxChars);

  // Find first period AFTER minChars (but before maxChars)
  const periodIndex = limitedText.indexOf('.', minChars);

  // If a valid period is found in range, cut there
  if (periodIndex !== -1) {
    return limitedText.slice(0, periodIndex + 1);
  }

  // Otherwise hard cut at maxChars
  if (text.length > maxChars) {
    return limitedText + '...';
  }

  return text;
};


