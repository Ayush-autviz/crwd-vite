/**
 * CRWD Color System
 * 
 * This file defines the color palette for the CRWD application.
 * Use these color variables throughout the application to maintain consistency.
 */

// Primary colors
export const colors = {
  // Brand colors
  primary: {
    50: 'oklch(0.98 0.02 264.376)',
    100: 'oklch(0.95 0.04 264.376)',
    200: 'oklch(0.9 0.08 264.376)',
    300: 'oklch(0.8 0.12 264.376)',
    400: 'oklch(0.7 0.16 264.376)',
    500: 'oklch(0.6 0.2 264.376)', // Main primary color
    600: 'oklch(0.5 0.24 264.376)',
    700: 'oklch(0.4 0.28 264.376)',
    800: 'oklch(0.3 0.32 264.376)',
    900: 'oklch(0.2 0.36 264.376)',
  },
  
  // Neutral colors
  neutral: {
    50: 'oklch(0.98 0 0)',
    100: 'oklch(0.95 0 0)',
    200: 'oklch(0.9 0 0)',
    300: 'oklch(0.8 0 0)',
    400: 'oklch(0.7 0 0)',
    500: 'oklch(0.6 0 0)',
    600: 'oklch(0.5 0 0)',
    700: 'oklch(0.4 0 0)',
    800: 'oklch(0.3 0 0)',
    900: 'oklch(0.2 0 0)',
  },
  
  // Accent colors
  accent: {
    blue: 'oklch(0.6 0.18 264.376)',
    green: 'oklch(0.7 0.17 162.48)',
    yellow: 'oklch(0.8 0.19 84.429)',
    red: 'oklch(0.65 0.24 27.325)',
    purple: 'oklch(0.6 0.24 303.9)',
  },
  
  // Semantic colors
  semantic: {
    success: 'oklch(0.7 0.17 162.48)',
    warning: 'oklch(0.8 0.19 84.429)',
    error: 'oklch(0.65 0.24 27.325)',
    info: 'oklch(0.6 0.18 264.376)',
  },
  
  // Background colors
  background: {
    light: 'oklch(1 0 0)',
    dark: 'oklch(0.145 0 0)',
    muted: 'oklch(0.97 0 0)',
    mutedDark: 'oklch(0.269 0 0)',
  },
  
  // Text colors
  text: {
    primary: 'oklch(0.145 0 0)',
    secondary: 'oklch(0.4 0 0)',
    muted: 'oklch(0.556 0 0)',
    light: 'oklch(0.985 0 0)',
  },
  
  // Border colors
  border: {
    light: 'oklch(0.922 0 0)',
    dark: 'oklch(1 0 0 / 10%)',
  },
};

// Color themes
export const lightTheme = {
  background: colors.background.light,
  foreground: colors.text.primary,
  card: colors.background.light,
  cardForeground: colors.text.primary,
  popover: colors.background.light,
  popoverForeground: colors.text.primary,
  primary: colors.primary[500],
  primaryForeground: colors.background.light,
  secondary: colors.neutral[200],
  secondaryForeground: colors.text.primary,
  muted: colors.background.muted,
  mutedForeground: colors.text.muted,
  accent: colors.neutral[200],
  accentForeground: colors.text.primary,
  destructive: colors.semantic.error,
  border: colors.border.light,
  input: colors.border.light,
  ring: colors.neutral[400],
};

export const darkTheme = {
  background: colors.background.dark,
  foreground: colors.text.light,
  card: colors.neutral[800],
  cardForeground: colors.text.light,
  popover: colors.neutral[800],
  popoverForeground: colors.text.light,
  primary: colors.primary[400],
  primaryForeground: colors.background.dark,
  secondary: colors.neutral[700],
  secondaryForeground: colors.text.light,
  muted: colors.background.mutedDark,
  mutedForeground: colors.neutral[400],
  accent: colors.background.mutedDark,
  accentForeground: colors.text.light,
  destructive: colors.semantic.error,
  border: colors.border.dark,
  input: 'oklch(1 0 0 / 15%)',
  ring: colors.neutral[500],
};


export const PrimaryBlue = '#1600ff';