# Enterprise Hospital Operations & Resource Management

Module 12 of ArogyaOS

## Architecture
The Hospital Operations module provides a fully integrated, multi-tenant capable resource tracking engine. It models the physical constraints of a hospital (Campuses -> Buildings -> Floors -> Wards -> Rooms -> Beds) while governing complex logistical workflows such as Patient Admission, ICU Transfers, Operating Theatre Scheduling, and Staff Rostering.

## Folder Structure
- `types/` - Domain interfaces (Admission, Transfer, ProcedureBooking, MaintenanceRequest)
- `core/` - Constants, Types, Events, Hardening (Cache, Offline, Retry, Observability, Audit)
- `utils/` - Validation Schemas (Zod)
- `repositories/` - Data access interfaces
- `services/` - Business logic and orchestrations
- `hooks/` - React Query integrations
- `components/` - Role-based UI presentations (Executive, Ward Management, Bed Admin, etc.)

## Workflows
- **Admission Lifecycle**: Scheduled -> Admitted -> Observation -> Discharged/Transferred.
- **Physical Layout Management**: Wards aggregate Rooms, which contain Beds. The system automatically rolls up capacity limits via the `CapacityPlanningService`.
- **Maintenance & Logistics**: Faulty equipment triggers maintenance requests, automatically updating asset status and notifying rostering dependencies.

## Hardening & Integration
- **Cache**: Fast resolution via `HospitalOperationsCache`
- **Offline**: Resilient routing via `HospitalOperationsOfflineService`
- **Retry**: `HospitalOperationsRetry` wraps generic operations
- **Observability**: Execution tracing in `HospitalOperationsObservability`
- **Audit**: Log tracking in `HospitalOperationsAudit`
- **Timeline**: Integrated via `TimelineIntegrationService`

## Extension Guide
To extend facility definitions (e.g., modeling Ambulances or Helicopter Pads), adjust the domain types inside `types/index.ts`, define new repository abstractions, and integrate them safely into the `OccupancyService` without disrupting the existing hierarchy.
