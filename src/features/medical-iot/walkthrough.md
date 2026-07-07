# Walkthrough: Medical IoT & Remote Patient Monitoring

## 1. Gateway & Device Registration
A network admin accesses the `GatewayManagementWorkspace`. Using standard abstractions, the `GatewayService` registers the structural metadata representing an edge IoT hub. Subsequently, a new Continuous Glucose Monitor (CGM) is formally registered into the system through the `MedicalDeviceService`.

## 2. Remote Patient Assignment
A clinician opens the `RemoteMonitoringWorkspace` and establishes a `RemoteMonitoringPlan` for a patient, formally prescribing the CGM. The `DeviceAssignmentService` structurally maps the hardware identifier to the patient's UUID.

## 3. Observation Streaming & Validation
The physical gateway reads BLE data and posts a JSON batch to ArogyaOS. The `ObservationValidationService` verifies that the `ObservationConfidence` meets the required 'Good' threshold and timestamps are logically sound. 

## 4. Alerting & Visualization
If an anomaly is detected, the `AlertManagementService` constructs an `AlertEvent`. Simultaneously, the `MedicalIoTCache` rapidly invalidates its payload. The clinician viewing the `ObservationWorkspace` sees an immediate update via the `useObservations` React Query hook.

## 5. Timeline Commit
Finally, `TimelineIntegrationService` securely locks the entire trajectory (e.g. `ObservationReceived`, `AlertGenerated`) into the immutable Health Vault timeline, ensuring an exact legal audit trail is maintained without ever requiring the web client to execute WebBluetooth polling logic.
