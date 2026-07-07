# Enterprise Pharmacy Operations Module (Module 8)

## Architecture
The Pharmacy Module provides a comprehensive suite for medication dispensing, inventory tracking, and safety validation. It strictly adheres to the enterprise architectural standards of ArogyaOS.

## Folder Structure
- `types/`: Strongly typed domain interfaces (Medication, Inventory, Dispense).
- `core/`: Shared constants, specific errors, observability, cache, and retry mechanisms.
- `repositories/`: Data access layer for Inventory, Dispensing, Suppliers.
- `services/`: Business logic encompassing complex pharmaceutical processes.
- `hooks/`: React Query abstractions for UI integrations.
- `components/`: Accessible UI components.
- `pages/`: Page-level route entries.
- `utils/`: Validations and A11y helpers.

## Features
- **Inventory Engine**: Automated batch management, low-stock triggers, and expiry monitoring.
- **Dispensing Flow**: End-to-end prescription validation, stock reservation, and timeline auditing.
- **Safety**: Drug interactions and patient allergy conflict detection.
- **Enterprise Features**: Robust offline support, dynamic cache, aggressive retry strategies.
- **Controlled Substances**: Strict auditing and witnessing integration.

## Extension Guide
To add new features:
1. Extend types in `types/index.ts`.
2. Add validations in `utils/validations.ts`.
3. Scaffold repository definitions.
4. Implement business rules in `services/`.
5. Expose via React Query in `hooks/`.
6. Implement fully accessible UI components.
