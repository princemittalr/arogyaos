# Walkthrough & Architectural Justifications

## Design Decisions and Boundaries

### Why BI Engines are External
ArogyaOS operates as a highly available, transactionally secure healthcare OS. Embedding an OLAP engine (like ClickHouse or Druid) directly into the monolith would violate resource isolation constraints and compromise operational stability. This module purely manages the *metadata* of reports, acting as a control plane for external BI engines to execute heavy queries asynchronously.

### Why Charts are External
Integrating client-side charting libraries (Chart.js, D3) into the React Native / Web core creates immense bundle bloat and tightly couples the OS to specific visual interpretations. ArogyaOS exposes layout grids and metric references (`useDashboardWidgets`); the actual visual painting is delegated to dedicated renderer modules or iframe overlays handled by the BI integration layer.

### Why SQL is External
Allowing raw SQL strings to be generated and executed by the React application exposes the OS to injection vectors and severe performance degradation. The `AnalyticsWorkspace` maps user requests to abstract `AnalyticsQuery` UUIDs, which an isolated data warehouse safely interprets behind strict firewalls.

## Phase Overview
- **Phase 1**: We established the exact shapes (`Metric`, `Scorecard`, `KPI`) required to define healthcare business logic, shielding them with strict Zod types.
- **Phase 2**: Service orchestrators were built to manage the lifecycle of these configurations (e.g., deprecating a KPI) while emitting precise `Timeline` events.
- **Phase 3**: React Query hooks securely exposed these services to the UI layer, standardizing caching and invalidation logic.
- **Phase 4**: WCAG 2.2 AA compliant React workspaces were generated to allow Enterprise IT admins to visually configure grid layouts and metric mappings.
- **Phase 5**: The entire module was fortified with `ReportingOfflineService` (for offline configuration resilience) and `ReportingAudit` (for immutable change logs).
