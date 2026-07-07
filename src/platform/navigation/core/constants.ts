export const NAVIGATION_TYPES = [
  'Link',
  'Button',
  'Dropdown',
  'Divider'
] as const;

export const ROUTE_TYPES = [
  'Internal',
  'External',
  'Hash'
] as const;

export const LAYOUT_TYPES = [
  'Default',
  'FullWidth',
  'SidebarHidden'
] as const;

export const SIDEBAR_MODES = [
  'Expanded',
  'Collapsed',
  'Hover',
  'Hidden'
] as const;

export const THEME_MODES = [
  'Light',
  'Dark',
  'System'
] as const;

export const SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'fr',
  'de',
  'hi',
  'zh',
  'ar'
] as const;

export const WORKSPACE_TYPES = [
  'Clinical',
  'Administrative',
  'Financial',
  'PublicHealth',
  'Executive'
] as const;

export const NAVIGATION_PRIORITIES = [
  'High',
  'Medium',
  'Low'
] as const;

export const ICON_CATEGORIES = [
  'Core',
  'Medical',
  'Financial',
  'Administrative',
  'Alert'
] as const;
