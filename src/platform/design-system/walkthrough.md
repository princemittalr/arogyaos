# Walkthrough & Architectural Justifications

## Design Decisions and Boundaries

### Why Rendering and CSS Frameworks are External
ArogyaOS manages massive clinical environments where UI technologies evolve rapidly. Tightly coupling physical CSS paradigms (e.g. styled-components vs Tailwind vs CSS Modules) into the platform core introduces severe tech-debt risk. By defining the Enterprise Design System as **metadata abstractions**, clinical applications can mathematically depend on the `ColorToken` schemas and `SpacingToken` grids regardless of the UI library they compile down to. 

### Why the Design System is Metadata-Driven
A metadata-driven system ensures that design governance acts as a strict configuration layer. By validating colors against WCAG contrast constraints using pure math (Zod schemas) before the token ever touches a React component, ArogyaOS prevents non-accessible elements from being physically painted into the DOM.

## Phase Overview
- **Phase 1**: We established the exact blueprint logic (`ColorToken`, `BreakpointToken`, `TypographyToken`) using exhaustive Constants and mathematically strict Zod validatons.
- **Phase 2**: Service orchestrators were built to manage the creation, auditing, and structural mapping of these visual constraints without compiling actual styles.
- **Phase 3**: React Query hooks securely exposed these services to the UI, guaranteeing deterministic cache synchronization.
- **Phase 4**: WCAG 2.2 AA compliant React workspaces were generated, offering Enterprise Administrators dynamic control panels to govern breakpoints, motion durations, and global theming across all modules visually.
- **Phase 5**: The platform was heavily fortified with offline configuration queueing (`DesignSystemOfflineService`) and precise tracking logs (`DesignSystemAudit`), ensuring visual modifications are indestructible, queued efficiently, and deeply trackable.
