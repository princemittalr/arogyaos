# Enterprise Reporting, Analytics & Executive Business Intelligence

Module 20 of ArogyaOS

## Architecture Overview
The Enterprise Reporting Module serves as the configurational command center for mapping all analytical metadata within ArogyaOS. It provides the strict structural definitions and orchestration logic for `Reports`, `Dashboards`, `Metrics`, `KPIs`, and `AnalyticsQueries`.

**Crucial Constraint:** This module is entirely metadata-driven. It does **not** execute SQL, generate physical PDF files, or render visual charts using libraries like D3 or Chart.js. Instead, it exposes deterministic, Zod-validated configurations that dedicated data warehouses (ClickHouse/Snowflake) and BI execution nodes read to safely generate results.

## Folder Structure
- `types/` - Core domain abstractions (`Dashboard`, `Metric`, `Scorecard`, `ExecutiveInsight`).
- `core/` - Enterprise hardening wrappers, including `ReportingCache`, Offline queues, and `ReportingAudit` trails.
- `utils/` - Zod schema validations ensuring query definitions are structurally safe.
- `repositories/` - Data access interfaces concealing internal database logic.
- `services/` - Orchestration boundary validating dashboard layouts and metric dependencies.
- `hooks/` - Front-end React Query bridges mapping configuration state to the UI.
- `components/` - Accessible (WCAG 2.2 AA) administrative workspaces for BI configuration.

## Workflows
- **Report & Dashboard Governance**: Define template layouts, grid coordinates, and widget definitions without deploying UI updates.
- **KPI Mapping**: Structurally map specific database metrics to strategic enterprise `KPI` definitions.
- **Executive Intelligence**: Configure high-level priority insights and scorecards that the ArogyaOS AI engine populates dynamically.

## Extension Guidelines
To connect this metadata layer to a physical BI tool (e.g., Apache Superset or Grafana), the external BI node should subscribe to this module's `EventCatalog` (e.g., `dashboard:updated`). The BI node reads the layout metadata, executes the underlying SQL, and returns the result reference back to the `useAnalytics` hook. ArogyaOS remains purely a control plane.
