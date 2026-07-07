export type NavigationType = 'Link' | 'Button' | 'Dropdown' | 'Divider';
export type RouteType = 'Internal' | 'External' | 'Hash';
export type LayoutType = 'Default' | 'FullWidth' | 'SidebarHidden';
export type SidebarMode = 'Expanded' | 'Collapsed' | 'Hover' | 'Hidden';
export type ThemeMode = 'Light' | 'Dark' | 'System';
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh' | 'ar';
export type WorkspaceType = 'Clinical' | 'Administrative' | 'Financial' | 'PublicHealth' | 'Executive';
export type NavigationPriority = 'High' | 'Medium' | 'Low';
export type IconCategory = 'Core' | 'Medical' | 'Financial' | 'Administrative' | 'Alert';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  type: NavigationType;
  icon?: string;
  priority: NavigationPriority;
  isActive?: boolean;
}

export interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
  isCollapsible: boolean;
  isCollapsed: boolean;
}

export interface NavigationSection {
  id: string;
  title: string;
  groups: NavigationGroup[];
  priority: NavigationPriority;
}

export interface NavigationCategory {
  id: string;
  name: string;
  sections: NavigationSection[];
}

export interface RouteDefinition {
  id: string;
  path: string;
  type: RouteType;
  title: string;
  isProtected: boolean;
  layout: LayoutType;
}

export interface RouteRegistry {
  id: string;
  routes: RouteDefinition[];
  defaultRouteId: string;
  fallbackRouteId: string;
}

export interface ModuleRoute {
  moduleId: string;
  registryId: string;
  mountPath: string;
  priority: NavigationPriority;
}

export interface Breadcrumb {
  id: string;
  label: string;
  path: string;
  isCurrent: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  actionId: string;
  shortcut?: string;
}

export interface CommandPaletteItem {
  id: string;
  title: string;
  description: string;
  actionId: string;
  category: string;
}

export interface SearchScope {
  id: string;
  name: string;
  placeholder: string;
  modules: string[];
}

export interface UserWorkspace {
  id: string;
  type: WorkspaceType;
  defaultLayout: LayoutType;
  navigationCategoryId: string;
}

export interface WorkspaceLayout {
  id: string;
  workspaceId: string;
  type: LayoutType;
  sidebarMode: SidebarMode;
}

export interface SidebarConfiguration {
  id: string;
  mode: SidebarMode;
  width: number;
  collapsedWidth: number;
  position: 'Left' | 'Right';
}

export interface TopbarConfiguration {
  id: string;
  height: number;
  showSearch: boolean;
  showNotifications: boolean;
  showProfile: boolean;
}

export interface ProfileMenu {
  id: string;
  items: NavigationItem[];
  showAvatar: boolean;
  showName: boolean;
}

export interface NotificationEntry {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  actionPath?: string;
}

export interface ThemeConfiguration {
  id: string;
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
}

export interface LanguageConfiguration {
  id: string;
  currentLanguage: SupportedLanguage;
  availableLanguages: SupportedLanguage[];
}

export interface NavigationPermission {
  routeId: string;
  requiredRoles: string[];
  requiredPermissions: string[];
}

export interface NavigationState {
  currentRouteId: string;
  currentWorkspaceId: string;
  breadcrumbs: Breadcrumb[];
  sidebarMode: SidebarMode;
}
