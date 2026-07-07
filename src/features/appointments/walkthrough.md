# Appointments Module — User Flow Walkthrough

## Booking Flow

```
User browses availability → Selects provider + slot → Confirms details → Appointment created
```

**Step-by-step:**
1. Patient browses available slots via `useAvailability()` hook (reads from `AvailabilityRepository`)
2. Patient selects date/time → UI dispatches through `useAppointments().createAppointment()`
3. `AppointmentService.createAppointment()` validates input via `AppointmentSchema`
4. Conflict check: `ConflictDetectionService.assertNoConflict()` verifies no double-booking
5. Firestore transaction: creates appointment record + timeline index entry
6. `Slot reserved` via `SchedulingService.reserveSlot()` marks slot unavailable
7. `AppointmentEventBus` publishes `AppointmentCreated`
8. `TimelineIntegrationService` listens → creates Health Vault timeline entry
9. `auditLogger` records `RECORD_CREATED` audit event
10. React Query cache invalidated → UI refreshes

**Key files:** `AppointmentService.ts:90-204`, `SchedulingService.ts:133-155`, `useAppointments.ts`

## Check-in Flow

```
Patient arrives → Receptionist checks in → Status updates → Notifications sent
```

**Step-by-step:**
1. Receptionist verifies patient identity
2. `useAppointments().checkIn()` called with appointment ID
3. `AppointmentService.checkIn()` validates state (must be SCHEDULED or CONFIRMED)
4. Records `checkInTime` and `checkInBy` on the appointment
5. `AppointmentEventBus` publishes `AppointmentCheckedIn`
6. `TimelineIntegrationService` updates timeline: "Appointment - Checked In"
7. UI refreshes → patient appears on provider's queue board

**Key files:** `AppointmentService.ts:294-330`, `useAppointments.ts`

## Reschedule Flow

```
Patient/Staff requests new slot → Validate availability → Create version → Update appointment
```

**Step-by-step:**
1. User selects new date/time from available slots
2. `useAppointments().rescheduleAppointment()` dispatches
3. `AppointmentService.rescheduleAppointment()` validates state (not COMPLETED or CANCELLED)
4. Previous slot released: `SchedulingService.releaseSlot()`
5. New slot reserved: `SchedulingService.reserveSlot()`
6. Firestore transaction: creates version snapshot of current state, then updates with new schedule
7. `rescheduledFrom` metadata records previous date + reschedule count
8. `AppointmentEventBus` publishes `AppointmentRescheduled`
9. `TimelineIntegrationService` creates new timeline entry with reschedule details
10. Reschedule limit checked (max 3 per `BOOKING_CONSTRAINTS.RESCHEDULE_LIMIT`)

**Key files:** `AppointmentService.ts:453-528`, `SchedulingService.ts`

## Cancellation Flow

```
User requests cancellation → Validate window → Update status → Release slot
```

**Step-by-step:**
1. User initiates cancellation with reason
2. `useAppointments().cancelAppointment()` dispatches
3. `AppointmentService.cancelAppointment()` validates state (not already COMPLETED or CANCELLED)
4. Slot released: `SchedulingService.releaseSlot()`
5. Appointment status → `CANCELLED` with cancellation metadata
6. `AppointmentEventBus` publishes `AppointmentCancelled`
7. `TimelineIntegrationService` updates timeline: "Appointment - Cancelled" (status → archived)
8. On confirmation, references the original scheduled + confirmed

**Key files:** `AppointmentService.ts:410-451`, `useAppointments.ts`

## Follow-up Flow

```
Original appointment → Doctor recommends follow-up → System creates new appointment
```

**Step-by-step:**
1. Doctor completes a consultation → `AppointmentService.completeAppointment()`
2. Doctor selects "Create Follow-Up" → `FollowUpService.createFollowUp()`
3. `getSuggestedInterval()` returns recommended interval based on appointment type:
   - GENERAL_CONSULTATION → 14 days
   - SURGERY → 7 days
   - HEALTH_CHECKUP → 365 days
4. New FOLLOW_UP appointment created via `AppointmentService.createAppointment()`
5. `useFollowUps()` hook surfaces upcoming and overdue follow-ups on dashboard

**Key files:** `FollowUpService.ts`, `useFollowUps.ts`

## Waiting List Promotion Flow

```
Slot becomes available → Highest-priority waiting patient notified → Entry promoted to scheduled
```

**Step-by-step:**
1. A slot opens (cancellation or reschedule)
2. Staff/System calls `WaitingListService.getNextInQueue(requestedType)`
3. Returns the highest-priority, earliest-created waiting entry
4. Staff contacts patient → if accepted, calls `WaitingListService.promoteEntry()`
5. Entry status → `scheduled`, records `scheduledAppointmentId`
6. `AppointmentEventBus` publishes `WaitingListPromoted`
7. `processExpiredEntries()` periodically cleans up stale entries

**Key files:** `WaitingListService.ts`, `useWaitingList.ts`

## Timeline Integration

All appointment lifecycle events sync to the Health Vault timeline:

```
AppointmentCreated     → Timeline: "GENERAL_CONSULTATION - Dr. Test" (ACTIVE)
AppointmentConfirmed   → Timeline: "GENERAL_CONSULTATION - Dr. Test - Confirmed"
AppointmentCheckedIn   → Timeline: "GENERAL_CONSULTATION - Dr. Test - Checked In"
AppointmentStarted     → Timeline: "GENERAL_CONSULTATION - Dr. Test - In Progress"
AppointmentCompleted   → Timeline: "GENERAL_CONSULTATION - Dr. Test - Completed"
AppointmentCancelled   → Timeline: "GENERAL_CONSULTATION - Dr. Test - Cancelled" (ARCHIVED)
AppointmentRescheduled → Timeline: "Rescheduled: 2026-07-10 -> 2026-07-15" (new entry)
AppointmentNoShow      → Timeline: "GENERAL_CONSULTATION - Dr. Test - No Show" (ARCHIVED)
```

This provides a longitudinal, patient-centric view across all healthcare interactions.

**Key file:** `TimelineIntegrationService.ts`

## Offline Support Flow

```
User performs action offline → Queued locally → Connection restored → Auto-sync
```

1. User creates/updates/cancels an appointment
2. `AppointmentOfflineService.enqueue()` saves to localStorage
3. UI shows pending indicator via `useAppointmentOffline().hasPending`
4. When connectivity returns, `VaultOfflineQueue` fires `online` event
5. `processPendingQueue()` iterates queue, calling executor for each
6. Successfully synced operations removed from queue
7. Max 5 retries per operation before dropping

**Key files:** `AppointmentOfflineService.ts`, `useAppointmentOffline.ts`

## Enterprise Instrumentation

Every operation is automatically instrumented:

```
AppointmentObservability.trackCreation() → [HV:Observability] appointment.create | 142ms | success
AppointmentObservability.trackCancellation() → [HV:Observability] appointment.cancel | 89ms | success
```

Failed operations record error codes and increment failure counters:

```
[HV:Observability:Error] appointment.create | AppointmentNotFoundError
```

**Key file:** `AppointmentObservability.ts`

## Future Extension Points

### Custom Appointment Types
Add new values to `APPOINTMENT_TYPE` in `core/constants.ts`, add interval suggestions in `FollowUpService.FOLLOW_UP_INTERVALS`, and create role-specific UI components.

### Enhanced Conflict Detection
Extend `ConflictDetectionService` with resource calendars, equipment bookings, and staff scheduling constraints.

### Real-time Updates
Connect `AppointmentEventBus` to WebSocket/SSE for push notifications across devices.

### Advanced Scheduling
Implement AI-driven slot optimization, batch scheduling for hospitals, and recurring appointment patterns.

### Multi-language Support
All status announcements and accessibility messages are ready for internationalization via the existing `LanguageProvider`.

### Custom Observability Adapters
Register Sentry, OpenTelemetry, or Firebase Performance adapters at app startup via `vaultObservability.registerAdapter()`.
