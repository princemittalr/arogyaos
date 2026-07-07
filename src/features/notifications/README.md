# Enterprise Notifications & Communication Platform

Module 9 of ArogyaOS

## Architecture
The Notifications module implements a multi-channel, role-based enterprise messaging platform. It integrates tightly with the ArogyaOS Health Vault and Event Bus, ensuring decoupled messaging and timeline auditing.

## Folder Structure
- `types/` - Domain interfaces (Notification, Campaign, Broadcast, Reminders)
- `core/` - Constants, Types, Events, Hardening (Cache, Offline, Retry, Observability, Audit)
- `utils/` - Validation Schemas (Zod)
- `repositories/` - Data access interfaces
- `services/` - Business logic and orchestrations
- `hooks/` - React Query integrations
- `components/` - Role-based UI presentations (Citizen, Doctor, Hospital, District)

## Hardening & Integration
- **Cache**: Fast resolution via `NotificationCache`
- **Offline**: Handled by `NotificationOfflineService` & `useNotificationOffline`
- **Retry**: `NotificationRetry` wraps operations
- **Observability**: Execution tracing in `NotificationObservability`
- **Audit**: Log tracking in `NotificationAudit`
- **Timeline**: Integrated via `TimelineIntegrationService`
