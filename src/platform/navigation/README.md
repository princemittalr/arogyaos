# Platform Phase 2: Global Navigation & Application Shell

Global Application Shell and Navigation layer for ArogyaOS.

## Overview
This platform layer functions as the unified navigation metadata orchestrator across the 20 isolated domain modules of ArogyaOS. It structurally maps navigation menus, workspaces, sidebars, topbars, and theming using strictly typed metadata abstractions without tightly coupling the application to specific rendering frameworks.

## Architecture
**Constraint Warning**: This module explicitly serves as a **Control Plane**. It does **not** contain Next.js routing logic, React Router integrations, state machine authentication guards, or physical UI rendering algorithms (e.g. animating a sidebar width). UI shells subscribe to this metadata layer to paint the workspace context. ArogyaOS manages the *definitions and structures*, protecting the frontend from severe monolithic coupling.

## Folder Structure
- `types/` - Strict typing for navigation states (`UserWorkspace`, `RouteRegistry`, `SidebarConfiguration`).
- `core/` - Global platform events, constants (Layout Modes, Theme Modes), and offline routing mechanisms.
- `utils/` - Zod schema validations ensuring valid routing and layout structures before UI rendering.
- `repositories/` - Interface boundaries defining persistence for layout metadata.
- `services/` - Metadata lifecycle orchestrators for sidebars, workspaces, themes, and commands.
- `hooks/` - Abstracted React Query hooks linking services to administration views.
- `components/` - WCAG 2.2 AA compliant IT Administration workspaces to configure the layouts visually.

## Extension Guidelines
To execute the global application shell defined by this module, construct a separate top-level Next.js layout (or equivalent React application wrapper). Configure the root wrapper to consume the `UserWorkspace` and `RouteRegistry` layouts emitted by this module, feeding them into standard `next/router` or `react-router-dom` interfaces to trigger actual client-side navigation.
