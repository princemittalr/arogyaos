# Walkthrough & Architectural Justifications

## Design Decisions and Boundaries

### Why Routing Runtime is External
ArogyaOS manages 20 highly complex healthcare modules. Directly coupling the routing definitions (e.g., specific Next.js page paths or React Router `useLocation` checks) into this module would cause catastrophic monolithic entanglement. By treating navigation as **metadata blueprints**, the platform enables micro-frontends and independent teams to dynamically register their routes (`RouteRegistry`) into a universal shell without modifying a central `App.tsx` file.

### Why Authentication is External
Navigation controls what the user sees, not who they are. Implementing authentication or authorization middlewares (JWT parsing, RBAC validation loops) inside the navigation shell mixes infrastructure boundaries. The Navigation module tracks *what permissions are required for a route* (`NavigationPermission`), allowing an external, dedicated Identity platform to enforce those conditions physically.

## Phase Overview
- **Phase 1**: We established the domain structure (`SidebarConfiguration`, `RouteRegistry`, `ThemeConfiguration`) using explicit constants and exhaustive Zod validations.
- **Phase 2**: Service orchestrators were built to manage the creation, modification, and archival of navigation and workspace templates.
- **Phase 3**: React Query hooks securely exposed these services to the UI, guaranteeing immediate cache invalidation across dependent application frames.
- **Phase 4**: WCAG 2.2 AA compliant React workspaces were generated, offering Enterprise IT administrators dynamic control panels to map module menus and toggle theme defaults visually.
- **Phase 5**: The module was rigorously hardened with offline configuration queueing (`NavigationOfflineService`) and precise tracking logs (`NavigationAudit`), ensuring modifications to the global routing tree are indestructible and trackable.
