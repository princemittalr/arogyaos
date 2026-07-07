# Enterprise Billing, Payments & Insurance Platform

Module 10 of ArogyaOS

## Architecture
The Billing module implements a comprehensive financial engine tailored for healthcare. It governs everything from multi-category invoice generation to robust insurance claim tracking.

## Folder Structure
- `types/` - Domain interfaces (Invoice, Payment, InsuranceClaim, Refund)
- `core/` - Constants, Types, Events, Hardening (Cache, Offline, Retry, Observability, Audit)
- `utils/` - Validation Schemas (Zod)
- `repositories/` - Data access interfaces
- `services/` - Business logic and orchestrations
- `hooks/` - React Query integrations
- `components/` - Role-based UI presentations (Citizen, Hospital, Finance, Insurance)

## Workflows
- **Invoice Lifecycle**: Draft -> Issued -> Paid/Partially Paid -> Overdue -> Voided
- **Payment Lifecycle**: Pending -> Processing -> Completed / Failed / Refunded
- **Claim Workflow**: Draft -> Submitted -> Processing -> Approved/Rejected -> Appealed

## Hardening & Integration
- **Cache**: Fast resolution via `BillingCache`
- **Offline**: Handled by `BillingOfflineService` & `useBillingOffline`
- **Retry**: `BillingRetry` wraps operations
- **Observability**: Execution tracing in `BillingObservability`
- **Audit**: Log tracking in `BillingAudit`
- **Timeline**: Integrated via `TimelineIntegrationService`

## Extension Guide
To add a new payment gateway, extend the `PaymentGateway` enum in `types/index.ts` and add routing logic within `PaymentService.ts`. Ensure to add appropriate `PaymentTransaction` mapping logic.
