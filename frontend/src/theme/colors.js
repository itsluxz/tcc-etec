// Central place for the app's visual language.
// Keeping colors/spacing here means every screen stays consistent
// and the whole palette can be re-themed from one file.

export const colors = {
  // Brand
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#EDE4FD',

  // Backgrounds
  background: '#F5F3FB',
  card: '#FFFFFF',

  // Text
  textPrimary: '#1F1B2E',
  textSecondary: '#8A8698',
  textInverse: '#FFFFFF',

  // Status / accents
  success: '#22A65A',
  warning: '#E08A2C',
  danger: '#E24C4B',
  info: '#3B6FE0',

  // Borders / dividers
  border: '#EEECF5',

  // Tag backgrounds
  tagPink: '#FCE7F3',
  tagPinkText: '#D6336C',
  tagBlue: '#E3EBFC',
  tagBlueText: '#3B6FE0',
  tagGreen: '#E4F7EA',
  tagGreenText: '#22A65A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#2E1065',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
};
