# Enterprise Telemedicine & Virtual Care Platform

Module 11 of ArogyaOS

## Architecture
The Telemedicine module provides a highly-decoupled metadata engine tracking virtual consultations. It models the state of Waiting Rooms, Participants, Streams, and Consultation summaries without tightly coupling to a single media vendor.

## Folder Structure
- `types/` - Domain interfaces (TelemedicineSession, Participant, ChatMessage)
- `core/` - Constants, Types, Events, Hardening (Cache, Offline, Retry, Observability, Audit)
- `utils/` - Validation Schemas (Zod)
- `repositories/` - Data access interfaces
- `services/` - Business logic and orchestrations
- `hooks/` - React Query integrations
- `components/` - Role-based UI presentations (Citizen, Doctor, Hospital Admin)

## Workflows
- **Session Lifecycle**: Scheduled -> Waiting -> InProgress -> Completed
- **Waiting Room Flow**: Participants wait until the Host Admits them, transitioning their `ParticipantStatus` from Waiting to Joined.
- **Consultation Lifecycle**: Doctors capture notes, prescribe labs/radiology, and issue summaries natively bound to the Health Vault.

## Hardening & Integration
- **Cache**: Fast resolution via `TelemedicineCache`
- **Offline**: Handled by `TelemedicineOfflineService` & `useTelemedicineOffline`
- **Retry**: `TelemedicineRetry` wraps operations
- **Observability**: Execution tracing in `TelemedicineObservability`
- **Audit**: Log tracking in `TelemedicineAudit`
- **Timeline**: Integrated via `TimelineIntegrationService`

## Extension Guide
To add a media layer, hook your Video Provider SDK (WebRTC/Twilio/LiveKit) into the React presentation layer, relying purely on the `SessionMetricsService` and `MediaSessionService` to sync connection state boundaries and Bandwidth metrics.
