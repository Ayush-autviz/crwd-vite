import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to truncate description at first period (character-based)
export const truncateAtFirstPeriod = (
  text: string,
  minChars = 50,
  maxChars = 125
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



const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const BASE = ALPHABET.length;

// keep SAME everywhere (frontend + backend)
const SECRET_SALT = 918273645; // any large constant

const MIN_LENGTH = 10;

/* ---------------- BASE62 ---------------- */

function base62Encode(num: number): string {
  let str = "";

  while (num > 0) {
    str = ALPHABET[num % BASE] + str;
    num = Math.floor(num / BASE);
  }

  return str || "0";
}

function base62Decode(str: any) {
  let num = 0;

  for (const ch of str) {
    num = num * BASE + ALPHABET.indexOf(ch);
  }

  return num;
}

/* ---------------- ENCODE ---------------- */

export function encodePostId(id: any) {
  // hide sequential pattern
  const mixed = id ^ SECRET_SALT;

  let encoded = base62Encode(mixed);

  // deterministic padding (NOT random)
  encoded = encoded.padStart(MIN_LENGTH, "a");

  return encoded;
}

/* ---------------- DECODE ---------------- */

export function decodePostId(encoded: any) {
  // remove padding
  const clean = encoded.replace(/^a+/, "");

  const mixed = base62Decode(clean);

  return mixed ^ SECRET_SALT;
}