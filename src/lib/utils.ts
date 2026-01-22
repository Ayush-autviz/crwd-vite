import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to truncate description at first period (character-based)
export const truncateAtFirstPeriod = (text: string): string => {
  if (!text) return text;

  const charCount = text.length;

  // If text is short enough, return as is
  if (charCount <= 75) {
    return text;
  }

  // Limit text to max 125 characters
  const limitedText = text.slice(0, 125);

  // Find first full stop within the limited range
  const periodIndex = limitedText.indexOf('.');

  // If a period exists, cut at that point
  if (periodIndex !== -1) {
    return limitedText.substring(0, periodIndex + 1);
  }

  // Fallback: return limited text if no period found
  return `${limitedText}...`;
};
