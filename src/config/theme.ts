export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type ThemeType = typeof THEMES[keyof typeof THEMES];

export const DEFAULT_THEME: ThemeType = THEMES.SYSTEM;
