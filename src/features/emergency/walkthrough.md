# Walkthrough: Emergency Response Lifecycle

## 1. Call & Case Creation
An `EmergencyCall` is received at the dispatch center. The `EmergencyCaseService` instantiates a new `EmergencyCase` binding the location coordinates and caller details.

## 2. Dispatch Assignment
The `DispatchService` triggers. Based on the case severity, `useAmbulances` queries the active fleet. An optimal vehicle (e.g., Advanced Life Support) and `Crew` are assigned to the `DispatchAssignment`.

## 3. Scene Arrival & Assessment
The ambulance arrives on the scene. The Paramedic utilizes the Clinical Workspace (which may operate in offline mode via `EmergencyOfflineService`) to record initial `VitalSigns` and conduct a strict ESI `TriageAssessment`.

## 4. Treatment & Transport
While en route to the destination hospital, `TreatmentService` logs real-time medications and trauma interventions. `RoutePlanningService` provides abstract ETA calculations.

## 5. Hospital Handover
Approaching the hospital, `HospitalCoordinationService` validates target capacity. Upon arrival, the `HospitalHandoverService` is executed to finalize clinical notes and safely transfer the `EmergencyPatient`.

## 6. Closure & Audit
The case is closed. Every major transition (e.g., `PatientLoaded`, `HospitalArrived`) is synchronously published to the global `TimelineIntegrationService` and `EmergencyAudit` ledger.
