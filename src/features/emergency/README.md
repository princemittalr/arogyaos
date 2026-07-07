# Enterprise Emergency Medical Services (EMS) & Ambulance Management

Module 13 of ArogyaOS

## Architecture
The EMS Module manages the complete lifecycle of pre-hospital emergency care. It is strictly metadata-driven and intentionally decouples geographic visualization (Map SDKs) from logistical decision-making. The system heavily leverages Zod for deeply nested physiological payloads (Vital Signs, Triage).

## Folder Structure
- `types/` - Core interfaces (EmergencyCase, TriageAssessment, Ambulance, RouteWaypoint)
- `core/` - Constants, Errors, Events, and Hardening (Cache, Offline, Retry, Audit, Observability)
- `utils/` - Zod Schemas
- `repositories/` - Data access layer abstractions
- `services/` - Orchestration logic (TriageService, RoutePlanningService, DispatchService)
- `hooks/` - React Query abstraction
- `components/` - Structural UI shells for multiple EMS actors (Dispatchers, Paramedics, Executives)
- `pages/` - View composition

## Workflows
- **Emergency Lifecycle**: EmergencyCall -> EmergencyCase -> DispatchAssignment -> Transport -> HospitalHandover -> Closed.
- **Triage**: Follows the strict 5-level Emergency Severity Index (ESI) standard.
- **Route Metadata**: Calculations for ETAs and alternate routing are resolved purely via abstract lat/lng arrays and distance metrics, without relying on proprietary mapping dependencies in the UI.

## Hardening & Integration
- **Cache**: Pre-computes fast retrieval of active fleet metrics and dispatch queues.
- **Offline**: Captures vital assessments and treatment logs when an ambulance loses connectivity, syncing transparently upon reconnection.
- **Timeline**: Publishes immutable state transitions to Health Vault.

## Extension Guide
To integrate third-party GPS SDKs (e.g. Mapbox), create a separate UI package that strictly consumes the `useRoutePlanning` hook from this module, ensuring business rules stay secure inside the `arogyaOS` core domain.
