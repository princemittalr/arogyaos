# Walkthrough: Hospital Operations Module

## Patient Journey: Admission to Discharge
1. **Admission**: Triggered by a confirmed Appointment or Emergency intake using `AdmissionService.admitPatient`.
2. **Bed Allocation**: `BedManagementService` allocates a specific `Bed` within an initial `Ward`, modifying the hospital's active Capacity Metrics.
3. **Transfers**: During their stay, an `ICU` transfer might be mandated via `TransferService`. Bed availability is queried instantly across the target ward.
4. **Procedures**: Surgeries trigger `ProcedureSchedulingService`, binding `OperatingTheatres` and requisite Staff parameters.
5. **Discharge**: Process completes via `DischargeService.initiateDischarge`. The original `Bed` enters `Cleaning` status before returning to `Available`, recalculating overall Occupancy KPIs dynamically.

## Staff & Equipment Workflow
- `StaffRosterService` assigns nurses to specific Wards based on patient acuity and capacity limits.
- The `EquipmentService` binds mobile physical resources (e.g., Ventilators, X-Ray carts) to specific patients or Operating Theatres, updating `HospitalDashboardService` metrics universally in real-time.
