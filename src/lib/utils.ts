import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to truncate description at first period
export const truncateAtFirstPeriod = (text: string): string => {
  if (!text) return text;
  if (text.length < 30) return text;
  const periodIndex = text.indexOf('.');
  const newText = periodIndex !== -1 ? text.substring(0, periodIndex + 1) : text;
  if (newText.length < 30) return text;
  else return newText
};