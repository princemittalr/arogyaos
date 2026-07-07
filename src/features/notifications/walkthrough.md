# Walkthrough: Notifications Module

## Notification Lifecycle
1. Event Triggers: Notifications are created via `NotificationService.createNotification`.
2. Delivery Routing: Handled by `DeliveryService`, resolving to In-App, Push, Email, etc.
3. Acknowledgement: System tracks Delivery and Read states, writing to `CommunicationLogService`.

## Campaigns & Broadcasts
- Campaigns focus on targeted audiences based on demographics (managed via `CampaignService`).
- Broadcasts prioritize immediate delivery for Emergencies, Hospitals, and Districts (managed via `BroadcastService`).

## Offline & Timeline
- Operations like marking as read or archiving are queued by `NotificationOfflineService`.
- Crucial lifecycle states sync to the Health Vault via `TimelineIntegrationService` subscribing to the `NotificationEventBus`.
