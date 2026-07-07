# Enterprise Medical IoT, Device Integration & Remote Patient Monitoring

Module 17 of ArogyaOS

## Architecture
The Medical IoT Module strictly serves as a metadata-driven orchestration framework for managing hardware telemetry across the clinical enterprise. It securely defines the topological boundaries of clinical observation and device lifecycle management. It acts as an absolute isolation layer, inherently preventing the execution of unpredictable third-party WebBluetooth, HealthKit, or proprietary vendor SDKs inside the core ArogyaOS interface. 

## Folder Structure
- `types/` - Strict domain abstractions (e.g. ObservationSeries, RemoteMonitoringPlan).
- `core/` - Eventing, Caching (MedicalIoTCache), and Resilience patterns (MedicalIoTOfflineService).
- `utils/` - Infallible Zod payload validators.
- `repositories/` - Data interface definitions.
- `services/` - Core abstraction logic (ObservationValidationService, AlertManagementService).
- `hooks/` - Abstracted React Query bridge.
- `components/` - Enterprise semantic viewing dashboards.

## Workflows
- **Device Lifecycle**: Defines `MedicalDevice`, assigns via `DeviceAssignment`, tracks through `DeviceHealth`, and permanently archives metadata via `MedicalIoTAudit`.
- **Observation Pipeline**: A background ingress gateway reads real-world data and pushes the resulting JSON `Observation` array to ArogyaOS. ArogyaOS strictly validates (Range, Timestamp, Quality) using `ObservationValidationService` before committing it to the `Health Vault Timeline`.
- **Alert Escalation**: `AlertManagementService` processes abstracted warning thresholds, piping `AlertEvent`s to the UI without managing physical device sirens.

## Hardening & Integration
- **Cache**: Fast, localized metadata TTIs (e.g. 60s for `DeviceConnectivity`).
- **Offline Mode**: Secures operations like `UpdateDeviceMetadata` even when clinical dashboard terminals drop network state.
- **Audit Logging**: Every event (`ObservationReceived`, `FirmwareUpdated`) translates securely to immutable Timeline commits.

## Extension Guide
To physically communicate with a Garmin watch, Dexcom G6, or a hospital's central ICU hub, deploy a standalone microservice acting as a protocol bridge. This bridge parses BLE/HL7 data, converts it to the explicit Zod schemas defined in this repository (`ObservationSchema`), and securely POSTs the metadata into the ArogyaOS orchestrator.
