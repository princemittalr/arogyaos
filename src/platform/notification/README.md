# Platform Phase 4: Enterprise Notification, Communication & Engagement Platform

Global architectural Communication Configuration layer for ArogyaOS.

## Overview
This platform layer functions as the unified metadata orchestrator for all outbound communications across the 20 isolated domain modules of ArogyaOS. It structurally maps routing policies, delivery fallbacks, template registries, and quiet-hours logic.

## Architecture
**Constraint Warning**: This module explicitly serves as a **Control Plane**. It does **not** contain SMTP connections, Twilio integrations, Firebase Cloud Messaging SDKs, or WebSocket pooling logic. The execution of a message delivery happens asynchronously in backend workers. ArogyaOS manages the *definitions and policies*, protecting the frontend from heavy SDK bundles and severe service-provider lock-in.

## Folder Structure
- `types/` - Strict typing for notification models (`NotificationChannel`, `NotificationDelivery`, `CommunicationPolicy`).
- `core/` - Global platform events, constants (Channels, Priorities), and offline queuing mechanisms.
- `utils/` - Intensive Zod schema validations ensuring valid payloads and target audience definitions before processing.
- `repositories/` - Interface boundaries defining persistence for notification configurations.
- `services/` - Metadata lifecycle orchestrators for templates, policies, inbox messages, and delivery tracking.
- `hooks/` - Abstracted React Query hooks linking services to configuration views.
- `components/` - WCAG 2.2 AA compliant IT Administration workspaces to govern routing logic globally.

## Extension Guidelines
To execute actual notification sends, construct a separate physical provider integration layer (e.g., SendGrid, AWS SNS, Twilio) inside your respective backend workers. Configure that layer to continuously query and consume the queued structured JSON payloads emitted by this platform layer.
