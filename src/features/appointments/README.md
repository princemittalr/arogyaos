# Appointments Module — Enterprise Documentation

## Architecture

The appointments module follows a **layered enterprise architecture** built on top of the ArogyaOS Health Vault platform:

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (Components)                   │
│   Citizen · Provider · Hospital · Lab · Radiology · Vacc.   │
├─────────────────────────────────────────────────────────────┤
│                      Hooks Layer                             │
│   useAppointments · useAppointmentCalendar · useAvailability │
│   useWaitingList · useFollowUps · useAppointmentStatistics  │
│   useAppointmentOffline                                     │
├─────────────────────────────────────────────────────────────┤
│                   Service Layer                              │
│   AppointmentService · CalendarService · AvailabilityService │
│   ConflictDetectionService · SchedulingService               │
│   WaitingListService · FollowUpService                       │
│   TimelineIntegrationService                                 │
├─────────────────────────────────────────────────────────────┤
│                 Enterprise Hardening (Phase 5)               │
│   AppointmentCache · AppointmentRetry · AppointmentObserv.   │
│   AppointmentOfflineService · AppointmentAuditEvents         │
│   Accessibility Utilities                                    │
├─────────────────────────────────────────────────────────────┤
│                  Repository Layer                             │
│   AppointmentRepository · AvailabilityRepository             │
│   ScheduleRepository · WaitingListRepository                 │
├─────────────────────────────────────────────────────────────┤
│               Health Vault Platform (Reused)                  │
│   MemoryCache · VaultOfflineQueue · withRetry                │
│   VaultObservability · AuditLogger · HealthVaultEventBus     │
│   TimelineRepository · BaseRepository · ulid                 │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
src/features/appointments/
├── core/
│   ├── constants.ts          — Status, priority, type enums + booking constraints
│   ├── errors.ts             — Domain error classes
│   └── events.ts             — AppointmentEventBus + event payload interfaces
├── types/
│   └── index.ts              — Appointment, CalendarEvent, WaitingListEntry, etc.
├── repositories/
│   ├── AppointmentRepository.ts     — CRUD + patient/provider/facility queries
│   ├── AvailabilityRepository.ts    — Provider/facility availability CRUD
│   ├── ScheduleRepository.ts        — Schedule CRUD + date-range queries
│   └── WaitingListRepository.ts     — Waiting list CRUD + priority queuing
├── services/
│   ├── AppointmentService.ts        — Core appointment lifecycle management
│   ├── AvailabilityService.ts       — Availability CRUD
│   ├── CalendarService.ts           — Day/week/month/agenda calendar events
│   ├── ConflictDetectionService.ts  — Double-booking, patient/room/equipment conflicts
│   ├── FollowUpService.ts           — Follow-up creation + interval suggestions
│   ├── SchedulingService.ts         — Schedule generation + slot reservation
│   ├── TimelineIntegrationService.ts — Health Vault timeline sync
│   └── WaitingListService.ts        — Waiting list queue management
├── hooks/
│   ├── useAppointments.ts           — Full CRUD + search/filter/sort/pagination
│   ├── useAppointmentCalendar.ts    — Multi-view calendar with navigation
│   ├── useAppointmentStatistics.ts  — Stats: counts, utilisation, averages
│   ├── useAppointmentOffline.ts     — Online/offline status + pending queue
│   ├── useAvailability.ts           — Provider/facility availability + slot counts
│   ├── useFollowUps.ts              — Upcoming/overdue follow-ups + suggestions
│   └── useWaitingList.ts            — Join/leave/promote + queue position
├── enterprise/
│   ├── AppointmentAuditEvents.ts    — Audit action constants
│   ├── AppointmentCache.ts          — Typed MemoryCache instances
│   ├── AppointmentObservability.ts  — VaultObservability wrapper
│   ├── AppointmentOfflineService.ts — localStorage-backed offline queue
│   └── AppointmentRetry.ts          — Retry wrappers with AbortSignal
├── utils/
│   ├── accessibility.ts             — WCAG 2.2 AA utilities
│   └── validations.ts              — Zod schemas for all entities
├── components/
│   ├── citizen/                     — Citizen-facing UI components
│   ├── hospital/                    — Hospital admin UI components
│   ├── provider/                    — Doctor/provider UI components
│   ├── laboratory/                  — Lab UI components
│   ├── radiology/                   — Radiology UI components
│   └── vaccination/                 — Vaccination UI components
├── pages/
│   ├── citizen/                     — Citizen dashboard page
│   ├── hospital/                    — Hospital dashboard page
│   ├── provider/                    — Provider dashboard page
│   ├── laboratory/                  — Lab dashboard page
│   ├── radiology/                   — Radiology dashboard page
│   └── vaccination/                 — Vaccination dashboard page
├── appointments.test.ts            — Comprehensive test suite
├── README.md                        — This file
├── task.md                          — Phase progress tracking
└── walkthrough.md                   — User flow walkthroughs
```

## Repositories

| Repository | Collection | Key Methods |
|---|---|---|
| `AppointmentRepository` | `appointments` | `getByPatientId`, `getByProviderId`, `getByFacilityId`, `getByDateRange`, `getByStatus`, `getUpcoming`, `getOverlapping` |
| `AvailabilityRepository` | `appointment_availability` | `getByProvider`, `getByFacility`, `getByDayOfWeek`, `create`, `update`, `delete` |
| `ScheduleRepository` | `appointment_schedules` | `getByProviderAndDate`, `getByFacilityAndDate`, `getByDateRange`, `create`, `update`, `delete` |
| `WaitingListRepository` | `appointment_waiting_list` | `getByPatient`, `getByRequestedType`, `getActiveByPriority`, `getExpiredEntries` |

All repositories provide `getById`, `create`, `update` with optional Transaction support. `AppointmentRepository` extends `BaseRepository<Appointment>` from the Health Vault platform (supports versioning via `createVersion` / `getVersion`).

## Services

### AppointmentService
Manages the full appointment lifecycle: create, update, confirm, check-in, start consultation, complete, cancel, reschedule, mark no-show. Each operation:
1. Validates current state
2. Executes Firestore transaction (with versioning for updates/reschedules)
3. Publishes domain event to `AppointmentEventBus`
4. Logs audit trail via `AuditLogger`
5. Syncs to Health Vault timeline

### SchedulingService
Generates daily/weekly/monthly schedules from provider availability definitions. Slots are generated with configurable duration and buffer times. Supports slot reservation (`reserveSlot`) and release (`releaseSlot`).

### ConflictDetectionService
Detects scheduling conflicts: double-booking (provider), patient overlap, room conflicts, and equipment conflicts.

### WaitingListService
Manages the waiting list queue. Supports joining, leaving, promoting entries, processing expired entries, and priority-ordered queue retrieval.

### CalendarService
Provides calendar event generation for day, week, month, and agenda views. Filters by provider and facility scope.

### FollowUpService
Creates follow-up appointments and provides evidence-based interval suggestions per appointment type.

### TimelineIntegrationService
Subscribes to all `AppointmentEventBus` events and synchronizes status changes to the Health Vault timeline for longitudinal patient records.

## Hooks

| Hook | React Query Keys | Purpose |
|---|---|---|
| `useAppointments(patientId)` | `['appointments', patientId]` | Full CRUD with client-side search, filter, sort, pagination |
| `useAppointmentCalendar(providerId, facilityId)` | `['appointments_calendar_*', ...]` | Multi-view calendar (day/week/month/agenda) |
| `useAvailability(providerId, facilityId)` | `['appointments_availability_*', ...]` | Availability + slot counts + next-available |
| `useWaitingList(patientId, requestedType)` | `['appointments_waiting_list_*', ...]` | Queue management + position tracking |
| `useFollowUps(patientId)` | `['appointments_followups', ...]` | Upcoming/overdue + suggested intervals |
| `useAppointmentStatistics(patientId)` | `['appointments_stats_*', ...]` | Counts by status, utilisation %, avg/day |
| `useAppointmentOffline()` | — | Connection status + pending queue + sync trigger |

All data hooks use TanStack React Query (v5) for caching, deduplication, and background refetching.

## Scheduling Engine

The scheduling engine (`SchedulingService`) converts provider availability definitions into concrete time slots:

1. **Availability Definition**: Provider sets working hours per day-of-week via `AvailabilityService`
2. **Schedule Generation**: `generateDailySchedule` reads availability, creates slots with configurable duration + buffer
3. **Slot Reservation**: `reserveSlot` marks a slot as unavailable during booking
4. **Slot Release**: `releaseSlot` restores availability on cancellation

The `generateSlots` private method produces slots from `startTime` to `endTime` with configurable `slotDurationMinutes` + `bufferMinutes` step.

## Conflict Detection

`ConflictDetectionService` provides:

- **Double-booking**: Provider already has overlapping appointment
- **Patient conflict**: Patient has another appointment at same time
- **Room conflict**: Room is double-booked
- **Equipment conflict**: Equipment may have scheduling overlap

All methods return a `ConflictCheckResult` with typed conflict array. `assertNoConflict` throws `DoubleBookingError` on detection.

## Waiting List

The waiting list system supports priority-ordered queuing:

- **Priority levels**: ROUTINE, URGENT, EMERGENCY, CRITICAL
- **Automatic ordering**: Higher priority + earlier creation date
- **Expiry**: Entries expire automatically via `processExpiredEntries`
- **Promotion**: `promoteEntry` transitions a patient from waiting → scheduled

## Offline Support

`AppointmentOfflineService` queues operations when offline:

- Supported operations: CREATE, UPDATE, CANCEL, RESCHEDULE, CHECK_IN, COMPLETE
- Queue stores operation type + appointment ID + payload (no PHI) in localStorage
- Deduplication prevents identical entries
- Max 5 retries per operation before dropping
- Auto-sync on connectivity restoration via `VaultOfflineQueue` connection listener
- `useAppointmentOffline` hook exposes `isOnline`, `pendingOperations`, `triggerSync`

## Cache

`AppointmentCache` provides typed in-memory caches using Health Vault's `MemoryCache`:

| Cache | Key Pattern | TTL | Purpose |
|---|---|---|---|
| `appointmentListCache` | patient ID | 30s | Appointment list queries |
| `calendarCache` | date + scope | 30s | Calendar event data |
| `availabilityCache` | provider/facility ID | 60s | Availability data |
| `waitingListCache` | patient/type | 30s | Waiting list entries |
| `statisticsCache` | patient ID | 60s | Statistics aggregation |
| `followUpCache` | patient ID | 30s | Follow-up data |

`invalidateAppointmentCaches(patientId?)` clears relevant caches on mutation.

## Retry

`AppointmentRetry` wraps Health Vault's `withRetry` with two profiles:

| Profile | Max Attempts | Initial Delay | Max Delay |
|---|---|---|---|
| `STANDARD_RETRY` | 3 | 300ms | 5s |
| `AGGRESSIVE_RETRY` | 5 | 200ms | 10s |

Both use exponential backoff with ±20% jitter. Non-retryable errors (validation, auth, not-found, abort) throw immediately. `createAbortSignal(timeoutMs)` creates timeout-bounded abort signals.

## Observability

`AppointmentObservability` instruments all appointment operations via Health Vault's `VaultObservability`:

- **11 tracked operations**: creation, confirmation, cancellation, reschedule, check-in, completion, calendar-load, availability-load, waiting-list-process, statistics-load, follow-up-load
- Each operation records: latency, success/failure outcome, error codes
- Counter metrics: `{operation}.success` / `{operation}.failure`
- Console adapter in development; pluggable for OpenTelemetry/Sentry in production

## Audit

Appointment audit actions (in `AppointmentAuditEvents`) extend the Health Vault audit system:

- `APPOINTMENT_CREATED`, `APPOINTMENT_UPDATED`, `APPOINTMENT_CANCELLED`
- `APPOINTMENT_RESCHEDULED`, `APPOINTMENT_CHECKED_IN`, `APPOINTMENT_COMPLETED`
- `WAITING_LIST_JOINED`, `WAITING_LIST_PROMOTED`

Audit entries are immutable, never contain PHI, and write to Firestore via `AuditLogger` with isolated error handling.

## Timeline

`TimelineIntegrationService` subscribes to the `AppointmentEventBus` and maintains the Health Vault timeline:

| Event | Timeline Action |
|---|---|
| `AppointmentCreated` | Create index entry with type `consultation` |
| `AppointmentConfirmed` | Update title suffix → "Confirmed" |
| `AppointmentCheckedIn` | Update title suffix → "Checked In" |
| `AppointmentStarted` | Update title suffix → "In Progress" |
| `AppointmentCompleted` | Update title suffix → "Completed" |
| `AppointmentCancelled` | Update title suffix → "Cancelled", status → archived |
| `AppointmentRescheduled` | Create new index entry with reschedule details |
| `AppointmentNoShow` | Update title suffix → "No Show", status → archived |

## Calendar

`CalendarService` generates calendar events from appointment data:

- **Day view**: Single date
- **Week view**: Monday–Sunday range
- **Month view**: Full calendar month
- **Agenda view**: Rolling 7 days past → 30 days future

All views support optional `providerId` and `facilityId` scoping.

## Accessibility

The accessibility utilities provide WCAG 2.2 AA compliance:

- `announceToScreenReader(message)` — Dynamic `aria-live` announcements
- `focusElement(elementId)` — Programmatic focus with smooth scroll
- `restoreFocus(previousElement)` — Focus restoration after dialog close
- `getTrapFocusHandler(containerId)` — Tab focus trapping for modals
- `createKeyboardNavigator(items, onActivate)` — Arrow-key list navigation
- `getAriaAnnouncementForStatusChange()` — Human-readable status announcements
- `A11Y_STATUS` — Map of status enums to readable labels

## Extension Guide

### Adding a new appointment type
1. Add to `APPOINTMENT_TYPE` in `core/constants.ts`
2. Add Zod enum value in `utils/validations.ts`
3. Add interval suggestion in `FollowUpService.FOLLOW_UP_INTERVALS`
4. Add UI component under `components/{role}/`

### Adding a new service method
1. Add method to appropriate service class
2. Add corresponding hook method if needed
3. Add event payload + publish in `core/events.ts` if domain event is needed
4. Subscribe in `TimelineIntegrationService.ts` for timeline sync
5. Add observability tracking in `AppointmentObservability.ts`

### Adding a new cache
1. Create `MemoryCache` instance in `enterprise/AppointmentCache.ts`
2. Add to `invalidateAppointmentCaches` if needed
3. Use cache in the appropriate service/hook

### Hooking up a real observability provider
1. Create adapter implementing `ObservabilityAdapter` interface
2. Call `vaultObservability.registerAdapter(yourAdapter)` at app startup
3. Adapter receives all span/error/counter events automatically
