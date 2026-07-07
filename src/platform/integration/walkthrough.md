# Walkthrough & Architectural Justifications

## Design Decisions and Boundaries

### Why Execution Engines are External
ArogyaOS operates as a highly available, UI-first platform. Embedding a saga execution runtime or state machine inside the client application creates massive performance bottlenecks and ties the orchestration layer to the browser lifecycle. By keeping this layer as a **metadata control plane**, we allow dedicated, scalable backend engines (like Temporal or Step Functions) to execute heavy cross-module sagas while ArogyaOS simply updates the UI based on tracking states.

### Why Queues are External
Integrating Kafka, BullMQ, or RabbitMQ directly into the frontend or OS monolithic core exposes the application to severe memory bloat and tight architectural coupling. The platform integration module manages *what* the routing logic should be (`IntegrationRulesWorkspace`) rather than *how* the messages are physically transported across the wire.

## Phase Overview
- **Phase 1**: We established the structural blueprints (`CrossModuleWorkflow`, `IntegrationRule`) using strictly typed, Zod-validated models. 
- **Phase 2**: Service orchestrators were built to manage the lifecycle of integrations (e.g., deprecating a workflow version) without writing physical execution code.
- **Phase 3**: React Query hooks securely exposed these services to the UI layer, standardizing caching and invalidation logic.
- **Phase 4**: WCAG 2.2 AA compliant React workspaces were generated to allow Enterprise IT admins to visually configure module dependencies and workflow triggers.
- **Phase 5**: The entire module was fortified with `PlatformIntegrationOfflineService` (for offline configuration resilience) and `PlatformIntegrationAudit` (for immutable change logs).
