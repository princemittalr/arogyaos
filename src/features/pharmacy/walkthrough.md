# Pharmacy Module Walkthrough

## Medication Lifecycle
1. **Creation**: Medications are registered with specific routes, formats, and safety parameters.
2. **Stock Receiving**: The `InventoryService` maps incoming batches against supplier profiles.
3. **Dispensing Workflow**: `DispensingService` integrates with `InteractionService` for safety checks, updates `MedicationInventory`, and writes to the `PharmacyEventBus`.
4. **Return Workflow**: Damaged or rejected dispenses are processed securely via `DispensingService`, restocking or flagging inventory accordingly.
5. **Recall Workflow**: Handled via `RecallService`, generating timeline events and isolating affected inventory automatically.
6. **Controlled Medication Workflow**: Enforces secondary verification and extensive audit trails per dose dispensed.

## Enterprise Integrations
### Timeline Integration
All significant state changes (`MEDICATION_DISPENSED`, `STOCK_ADJUSTED`) are synchronously published through the central `PharmacyEventBus` ensuring clinical transparency across ArogyaOS.

### Offline Synchronization
The `PharmacyOfflineService` traps dispensing mutations when disconnected, persisting them locally into a secure queue, and synchronizes automatically upon network restabilization.

### Future Extension Points
The system is built horizontally to allow integration with external supplier APIs, automated dispensing cabinets, and advanced IoT temperature sensors for storage validation.
