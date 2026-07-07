# Walkthrough: Billing Module

## Invoice Lifecycle
1. Event Triggers: Invoices are generated manually or automatically from appointments via `InvoiceService.createInvoice`.
2. Delivery Routing: Handled by Notifications Module, but Billing manages states transitioning from `Draft` to `Issued`.

## Payment Lifecycle
- Payments are processed via `PaymentService`. They support partial and split allocations across methods like Cash, Credit Card, and Insurance.

## Insurance & Claims
- Coverage verification relies on `InsuranceService`.
- Submit and track claims to providers via `ClaimService`. Claim responses map directly to Invoice status adjustments.

## Offline & Timeline
- Operations like recording payments are queued by `BillingOfflineService`.
- Crucial lifecycle states sync to the Health Vault via `TimelineIntegrationService` subscribing to the `BillingEventBus`.
