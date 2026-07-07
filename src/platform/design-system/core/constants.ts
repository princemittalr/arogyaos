export const COMPONENT_VARIANTS = [
  'Primary',
  'Secondary',
  'Tertiary',
  'Ghost',
  'Danger',
  'Warning',
  'Success',
  'Info'
] as const;

export const COMPONENT_SIZES = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl'
] as const;

export const COMPONENT_STATES = [
  'Default',
  'Hover',
  'Active',
  'Focus',
  'Disabled',
  'Loading',
  'Error'
] as const;

export const THEME_MODES = [
  'Light',
  'Dark',
  'HighContrast'
] as const;

export const DENSITY_MODES = [
  'Compact',
  'Comfortable',
  'Spacious'
] as const;

export const COLOR_CATEGORIES = [
  'Brand',
  'Neutral',
  'Semantic',
  'Background',
  'Text',
  'Border'
] as const;

export const SPACING_SCALE = [
  '0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64'
] as const;

export const TYPOGRAPHY_SCALES = [
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'
] as const;

export const SHADOW_LEVELS = [
  'none', 'sm', 'md', 'lg', 'xl', '2xl', 'inner'
] as const;

export const BORDER_RADII = [
  'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'
] as const;

export const ELEVATION_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const OPACITY_LEVELS = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100] as const;

export const MOTION_PRESETS = [
  'linear', 'easeIn', 'easeOut', 'easeInOut', 'spring'
] as const;

export const ANIMATION_DURATIONS = [
  '75ms', '100ms', '150ms', '200ms', '300ms', '500ms', '700ms', '1000ms'
] as const;

export const BREAKPOINTS = [
  'sm', 'md', 'lg', 'xl', '2xl'
] as const;

export const GRID_SIZES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
] as const;

export const LAYOUT_SIZES = [
  'sm', 'md', 'lg', 'xl', '2xl', 'full'
] as const;
