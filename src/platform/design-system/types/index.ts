export type DesignToken = string | number | object;
export type ComponentVariant = 'Primary' | 'Secondary' | 'Tertiary' | 'Ghost' | 'Danger' | 'Warning' | 'Success' | 'Info';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ComponentState = 'Default' | 'Hover' | 'Active' | 'Focus' | 'Disabled' | 'Loading' | 'Error';
export type ThemeMode = 'Light' | 'Dark' | 'HighContrast';
export type DensityMode = 'Compact' | 'Comfortable' | 'Spacious';

export interface ColorToken {
  id: string;
  name: string;
  value: string;
  category: 'Brand' | 'Neutral' | 'Semantic' | 'Background' | 'Text' | 'Border';
}

export interface TypographyToken {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
}

export interface SpacingToken {
  id: string;
  name: string;
  value: string;
}

export interface SizingToken {
  id: string;
  name: string;
  value: string;
}

export interface RadiusToken {
  id: string;
  name: string;
  value: string;
}

export interface BorderToken {
  id: string;
  name: string;
  width: string;
  style: string;
  colorId: string;
}

export interface ShadowToken {
  id: string;
  name: string;
  value: string;
}

export interface ElevationToken {
  id: string;
  level: number;
  shadowId: string;
}

export interface OpacityToken {
  id: string;
  name: string;
  value: number;
}

export interface MotionToken {
  id: string;
  name: string;
  duration: string;
  easing: string;
}

export interface AnimationToken {
  id: string;
  name: string;
  keyframes: Record<string, string>;
  motionId: string;
}

export interface TransitionToken {
  id: string;
  property: string;
  motionId: string;
}

export interface BreakpointToken {
  id: string;
  name: string;
  value: string;
}

export interface GridToken {
  id: string;
  columns: number;
  gapId: string;
}

export interface LayoutToken {
  id: string;
  maxWidth: string;
  containerPaddingId: string;
}

export interface ZIndexToken {
  id: string;
  name: string;
  value: number;
}

export interface ThemeToken {
  id: string;
  mode: ThemeMode;
  colors: Record<string, string>;
}

export interface IconToken {
  id: string;
  name: string;
  svgPath: string;
  category: string;
}

export interface IllustrationToken {
  id: string;
  name: string;
  svgPath: string;
  category: string;
}

export interface AccessibilityToken {
  id: string;
  minContrastRatio: number;
  focusRingId: string;
}

export interface FocusRingToken {
  id: string;
  width: string;
  style: string;
  colorId: string;
  offset: string;
}

export interface DensityConfiguration {
  id: string;
  mode: DensityMode;
  spacingMultiplier: number;
  sizingMultiplier: number;
}

export interface ThemeConfiguration {
  id: string;
  activeMode: ThemeMode;
  activeDensity: DensityMode;
  tokens: Record<string, DesignToken>;
}

export interface ResponsiveConfiguration {
  id: string;
  breakpoints: BreakpointToken[];
  baseFontSizeId: string;
}

export interface DesignSystemConfiguration {
  id: string;
  version: string;
  theme: ThemeConfiguration;
  responsive: ResponsiveConfiguration;
  accessibility: AccessibilityToken;
}
