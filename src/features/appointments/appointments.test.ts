import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/firebase/client', () => ({
  db: { type: 'mock-db' },
}));

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn(() => null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

const domElements = new Map<string, Record<string, unknown>>();
let activeEl: Record<string, unknown> | null = null;

function createDomEl(): Record<string, unknown> {
  const el: Record<string, unknown> = {
    id: '',
    textContent: '',
    className: '',
    getAttribute: vi.fn((attr: string) => {
      if (attr === 'aria-live') return 'polite';
      if (attr === 'aria-atomic') return 'true';
      if (attr === 'role') return 'status';
      return null;
    }),
    setAttribute: vi.fn(),
    focus: vi.fn(() => { activeEl = el; }),
    scrollIntoView: vi.fn(),
    remove: vi.fn(() => {
      domElements.delete(el.id as string);
    }),
    appendChild: vi.fn((child: Record<string, unknown>) => {
      if (child.id) domElements.set(child.id as string, child);
    }),
    querySelectorAll: vi.fn(() => []),
  };
  return el;
}

const mockDocument = {
  getElementById: vi.fn((id: string) => domElements.get(id) ?? null),
  createElement: vi.fn(() => createDomEl()),
  body: {
    appendChild: vi.fn((child: Record<string, unknown>) => {
      if (child.id) domElements.set(child.id as string, child);
    }),
  },
  get activeElement() { return activeEl; },
};

Object.defineProperty(globalThis, 'document', { value: mockDocument, writable: true });
Object.defineProperty(globalThis, 'requestAnimationFrame', { value: vi.fn((cb: () => void) => cb()), writable: true });
Object.defineProperty(globalThis, 'KeyboardEvent', {
  value: class MockKeyboardEvent {
    readonly key: string;
    readonly shiftKey: boolean;
    readonly preventDefault: ReturnType<typeof vi.fn>;
    constructor(type: string, opts: { key: string; shiftKey: boolean }) {
      this.key = opts.key;
      this.shiftKey = opts.shiftKey;
      this.preventDefault = vi.fn();
    }
  },
  writable: true,
});

let transactionSnap: unknown = null;

vi.mock('firebase/firestore', () => {
  const mockSnap = (data: unknown) => ({
    exists: () => !!data,
    data: () => data,
    id: data && typeof data === 'object' && 'recordId' in (data as Record<string, unknown>)
      ? (data as Record<string, unknown>).recordId
      : 'mock-id',
  });

  return {
    collection: vi.fn(() => ({ type: 'collection' })),
    doc: vi.fn((_db, path, ...segments) => ({ type: 'document', path, segments })),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(() => ({ type: 'query' })),
    where: vi.fn((field, op, val) => ({ type: 'where', field, op, val })),
    orderBy: vi.fn((field, dir) => ({ type: 'orderBy', field, dir })),
    runTransaction: vi.fn(async (_db, cb) => {
      const txMock = {
        get: vi.fn(async () => mockSnap(transactionSnap)),
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      return await cb(txMock);
    }),
    serverTimestamp: vi.fn(() => 'mock-server-timestamp'),
    Timestamp: {
      fromDate: vi.fn((d: Date) => ({ toDate: () => d, seconds: Math.floor(d.getTime() / 1000) })),
    },
  };
});

import { AppointmentRepository } from './repositories/AppointmentRepository';
import { AvailabilityRepository } from './repositories/AvailabilityRepository';
import { ScheduleRepository } from './repositories/ScheduleRepository';
import { WaitingListRepository } from './repositories/WaitingListRepository';
import { AppointmentService } from './services/AppointmentService';
import { AvailabilityService } from './services/AvailabilityService';
import { CalendarService } from './services/CalendarService';
import { ConflictDetectionService } from './services/ConflictDetectionService';
import { FollowUpService } from './services/FollowUpService';
import { SchedulingService } from './services/SchedulingService';
import { WaitingListService } from './services/WaitingListService';
import { TimelineIntegrationService } from './services/TimelineIntegrationService';
import { AppointmentEventBus } from './core/events';
import { AppointmentSchema } from './utils/validations';
import {
  AppointmentNotFoundError,
  InvalidAppointmentStateError,
  DoubleBookingError,
} from './core/errors';
import type { Appointment } from './types';
import type { AppointmentType, AppointmentPriority } from './core/constants';
import type { VaultOrigin } from '@/features/health-vault/types';
import {
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const mockOrigin: VaultOrigin = {
  deviceId: 'test-device',
  deviceType: 'test',
  platform: 'test',
  browser: 'test',
  appVersion: '1.0.0',
};

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    recordId: 'apt-1',
    ownerId: 'patient-1',
    appointmentId: 'apt-1',
    patientId: 'patient-1',
    patientName: 'Test Patient',
    appointmentType: 'GENERAL_CONSULTATION' as AppointmentType,
    status: 'SCHEDULED',
    priority: 'ROUTINE' as AppointmentPriority,
    source: 'CITIZEN_PORTAL',
    scheduledDate: '2026-07-10',
    startTime: '09:00',
    endTime: '09:30',
    durationMinutes: 30,
    providerId: 'doctor-1',
    providerName: 'Dr. Test',
    facilityId: 'facility-1',
    facilityName: 'Test Facility',
    participants: [],
    location: { type: 'physical' },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      updatedBy: 'user-1',
      version: 1,
      status: 'ACTIVE',
      source: 'citizen',
      ownerId: 'patient-1',
      origin: mockOrigin,
      verification: { isVerified: false },
      interoperability: {
        resourceType: 'Encounter',
        fhirVersion: 'R4',
        hashAlgorithm: 'SHA-256',
  checksumVersion: '1.0.0',
        },
        checksum: 'test-checksum',
    },
    ...overrides,
  };
}

// ─── Repositories ─────────────────────────────────────────────────────────────

describe('AppointmentRepository', () => {
  let repo: AppointmentRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new AppointmentRepository();
  });

  it('getByPatientId queries appointments collection', async () => {
    const mockDocs = [{ data: () => makeAppointment() }];
    vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as never);
    const result = await repo.getByPatientId('patient-1');
    expect(result).toHaveLength(1);
    expect(result[0].patientId).toBe('patient-1');
  });

  it('getByProviderId returns filtered results', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ data: () => makeAppointment({ providerId: 'doctor-1' }) }],
    } as never);
    const result = await repo.getByProviderId('doctor-1');
    expect(result).toHaveLength(1);
  });

  it('getByFacilityId returns filtered results', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ data: () => makeAppointment({ facilityId: 'facility-1' }) }],
    } as never);
    const result = await repo.getByFacilityId('facility-1');
    expect(result).toHaveLength(1);
  });

  it('getByDateRange queries scheduledDate range', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as never);
    const start = new Date('2026-07-01');
    const end = new Date('2026-07-31');
    const result = await repo.getByDateRange(start, end);
    expect(result).toEqual([]);
  });

  it('getByStatus returns appointments with matching status', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ data: () => makeAppointment({ status: 'COMPLETED' }) }],
    } as never);
    const result = await repo.getByStatus('COMPLETED');
    expect(result).toHaveLength(1);
  });

  it('getUpcoming returns active appointments', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { data: () => makeAppointment({ status: 'SCHEDULED' }) },
        { data: () => makeAppointment({ status: 'CONFIRMED' }) },
      ],
    } as never);
    const result = await repo.getUpcoming('doctor-1');
    expect(result).toHaveLength(2);
  });

  it('getOverlapping detects time conflicts', async () => {
    const apt = makeAppointment({ startTime: '08:00', endTime: '10:00' });
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ data: () => apt }],
    } as never);
    const result = await repo.getOverlapping('doctor-1', '2026-07-10', '09:00', '09:30');
    expect(result).toHaveLength(1);
  });

  it('getOverlapping excludes specified appointment', async () => {
    const apt = makeAppointment({ appointmentId: 'apt-1', startTime: '08:00', endTime: '10:00' });
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ data: () => apt }],
    } as never);
    const result = await repo.getOverlapping('doctor-1', '2026-07-10', '09:00', '09:30', 'apt-1');
    expect(result).toHaveLength(0);
  });

  it('getById returns null for non-existent', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as never);
    const result = await repo.getById('nonexistent');
    expect(result).toBeNull();
  });
});

describe('AvailabilityRepository', () => {
  let repo: AvailabilityRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new AvailabilityRepository();
  });

  it('create writes availability doc', async () => {
    const avail = {
      availabilityId: 'avail-1',
      providerId: 'doctor-1',
      providerName: 'Dr. Test',
      facilityId: 'facility-1',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      bufferMinutes: 0,
      isAvailable: true,
    };
    await repo.create(avail);
    expect(setDoc).toHaveBeenCalled();
  });

  it('delete removes availability doc', async () => {
    await repo.delete('avail-1');
    expect(deleteDoc).toHaveBeenCalled();
  });
});

describe('ScheduleRepository', () => {
  let repo: ScheduleRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ScheduleRepository();
  });

  it('getByProviderAndDate returns schedule', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({
      empty: false,
      docs: [{ data: () => ({ scheduleId: 'sched-1', providerId: 'doctor-1', date: '2026-07-10' }) }],
    } as never);
    const result = await repo.getByProviderAndDate('doctor-1', '2026-07-10');
    expect(result).not.toBeNull();
    expect(result!.scheduleId).toBe('sched-1');
  });

  it('getByProviderAndDate returns null when empty', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({ empty: true, docs: [] } as never);
    const result = await repo.getByProviderAndDate('doctor-1', '2026-07-10');
    expect(result).toBeNull();
  });
});

describe('WaitingListRepository', () => {
  let repo: WaitingListRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new WaitingListRepository();
  });

  it('getExpiredEntries queries expiryDate', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as never);
    const result = await repo.getExpiredEntries('2026-07-10');
    expect(result).toEqual([]);
  });
});

// ─── AppointmentService ───────────────────────────────────────────────────────

describe('AppointmentService', () => {
  let service: AppointmentService;
  let eventBus: AppointmentEventBus;

  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = AppointmentEventBus.getInstance();
    eventBus.reset();
    service = AppointmentService.getInstance();
  });

  it('createAppointment creates and returns id', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);

    const aptId = await service.createAppointment(
      {
        patientId: 'patient-1',
        patientName: 'Test',
        appointmentType: 'GENERAL_CONSULTATION',
        priority: 'ROUTINE',
        source: 'CITIZEN_PORTAL',
        scheduledDate: '2026-07-10',
        startTime: '09:00',
        durationMinutes: 30,
        providerId: 'doctor-1',
        providerName: 'Dr. Test',
        facilityId: 'facility-1',
        facilityName: 'Test Facility',
        participants: [],
        location: { type: 'physical' },
      },
      {
        ownerId: 'patient-1',
        createdBy: 'user-1',
        actorRole: 'citizen',
        source: 'citizen',
        origin: mockOrigin,
      },
    );

    expect(aptId).toBeTruthy();
    expect(typeof aptId).toBe('string');
  });

  it('createAppointment throws on validation failure', async () => {
    await expect(
      service.createAppointment(
        {} as never,
        {} as never,
      ),
    ).rejects.toThrow();
  });

  it('getAppointment throws when not found', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
    await expect(service.getAppointment('nonexistent')).rejects.toThrow(AppointmentNotFoundError);
  });

  it('confirmAppointment throws on invalid state', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => makeAppointment({ status: 'COMPLETED' }),
    } as never);
    await expect(
      service.confirmAppointment('apt-1', 'user-1', 'patient-1', 'doctor'),
    ).rejects.toThrow(InvalidAppointmentStateError);
  });

  it('confirmAppointment updates status', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => makeAppointment({ status: 'SCHEDULED' }),
    } as never);
    await service.confirmAppointment('apt-1', 'user-1', 'patient-1', 'doctor');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('checkIn updates status to CHECKED_IN', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => makeAppointment({ status: 'CONFIRMED' }),
    } as never);
    await service.checkIn('apt-1', 'user-1', 'patient-1', 'receptionist');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('checkIn throws when appointment not found', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
    await expect(
      service.checkIn('nonexistent', 'user-1', 'patient-1', 'receptionist'),
    ).rejects.toThrow(AppointmentNotFoundError);
  });

  it('completeAppointment updates status to COMPLETED', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => makeAppointment({ status: 'IN_PROGRESS' }),
    } as never);
    await service.completeAppointment('apt-1', 'user-1', 'patient-1', 'doctor', 'diagnosis', 'notes');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('cancelAppointment updates status to CANCELLED', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => makeAppointment({ status: 'SCHEDULED' }),
    } as never);
    await service.cancelAppointment('apt-1', 'user-1', 'patient-1', 'doctor', 'Patient request');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('rescheduleAppointment updates date and status', async () => {
    const apt = makeAppointment({ status: 'SCHEDULED' });
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => apt,
    } as never);
    transactionSnap = apt;
    await expect(
      service.rescheduleAppointment('apt-1', '2026-07-15', '10:00', 30, 'user-1', 'patient-1', 'doctor'),
    ).resolves.toBeUndefined();
  });

  it('markNoShow updates status to NO_SHOW', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => makeAppointment({ status: 'SCHEDULED' }),
    } as never);
    await service.markNoShow('apt-1', 'patient-1', 'doctor');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('getAppointmentsByPatient returns patient appointments', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ data: () => makeAppointment() }],
    } as never);
    const result = await service.getAppointmentsByPatient('patient-1');
    expect(result).toHaveLength(1);
  });

  it('getHistory returns version history', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => makeAppointment({
        metadata: { ...makeAppointment().metadata, version: 3 },
      }),
    } as never);
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

    const history = await service.getHistory('apt-1');
    expect(history.length).toBeGreaterThan(0);
  });
});

// ─── AvailabilityService ──────────────────────────────────────────────────────

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = AvailabilityService.getInstance();
  });

  it('setDoctorAvailability creates availability', async () => {
    const id = await service.setDoctorAvailability(
      'doctor-1', 'Dr. Test', 'facility-1', 1, '09:00', '17:00', 30,
    );
    expect(id).toBeTruthy();
    expect(setDoc).toHaveBeenCalled();
  });

  it('setLaboratoryAvailability delegates to setAvailability', async () => {
    const id = await service.setLaboratoryAvailability(
      'lab-1', 'Lab Test', 'facility-1', 2, '08:00', '16:00', 60,
    );
    expect(id).toBeTruthy();
    expect(setDoc).toHaveBeenCalled();
  });

  it('removeAvailability deletes availability', async () => {
    await service.removeAvailability('avail-1');
    expect(deleteDoc).toHaveBeenCalled();
  });

  it('getProviderAvailability returns provider data', async () => {
    const avail = {
      availabilityId: 'avail-1',
      providerId: 'doctor-1',
      providerName: 'Dr. Test',
      facilityId: 'facility-1',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      bufferMinutes: 0,
      isAvailable: true,
    };
    vi.mocked(getDocs).mockResolvedValue({ docs: [{ data: () => avail }] } as never);
    const result = await service.getProviderAvailability('doctor-1');
    expect(result).toHaveLength(1);
  });
});

// ─── CalendarService ──────────────────────────────────────────────────────────

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = CalendarService.getInstance();
  });

  it('getDayEvents returns events for a day', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ data: () => makeAppointment() }],
    } as never);
    const events = await service.getDayEvents('2026-07-10');
    expect(events).toHaveLength(1);
    expect(events[0].appointmentId).toBe('apt-1');
  });

  it('getWeekEvents returns events for a week', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
    const events = await service.getWeekEvents(new Date('2026-07-06'));
    expect(events).toEqual([]);
  });

  it('getMonthEvents returns events for a month', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
    const events = await service.getMonthEvents(2026, 7);
    expect(events).toEqual([]);
  });

  it('getAgendaEvents returns events for range', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
    const events = await service.getAgendaEvents(new Date('2026-07-01'), new Date('2026-08-01'));
    expect(events).toEqual([]);
  });
});

// ─── ConflictDetectionService ─────────────────────────────────────────────────

describe('ConflictDetectionService', () => {
  let service: ConflictDetectionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = ConflictDetectionService.getInstance();
  });

  it('detectDoubleBooking returns hasConflict false when no overlap', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
    const result = await service.detectDoubleBooking('doctor-1', '2026-07-10', '09:00', '09:30');
    expect(result.hasConflict).toBe(false);
  });

  it('detectDoubleBooking returns hasConflict true on overlap', async () => {
    const apt = makeAppointment({ startTime: '08:00', endTime: '10:00' });
    vi.mocked(getDocs).mockResolvedValue({ docs: [{ data: () => apt }] } as never);
    const result = await service.detectDoubleBooking('doctor-1', '2026-07-10', '09:00', '09:30');
    expect(result.hasConflict).toBe(true);
  });

  it('detectPatientConflict detects patient double-booking', async () => {
    const apt = makeAppointment({ startTime: '08:00', endTime: '10:00' });
    vi.mocked(getDocs).mockResolvedValue({ docs: [{ data: () => apt }] } as never);
    const result = await service.detectPatientConflict('patient-1', '2026-07-10', '09:00', '09:30');
    expect(result.hasConflict).toBe(true);
  });

  it('assertNoConflict throws DoubleBookingError on conflict', async () => {
    const apt = makeAppointment({ startTime: '08:00', endTime: '10:00' });
    vi.mocked(getDocs).mockResolvedValue({ docs: [{ data: () => apt }] } as never);
    await expect(
      service.assertNoConflict('doctor-1', '2026-07-10', '09:00', '09:30'),
    ).rejects.toThrow(DoubleBookingError);
  });
});

// ─── SchedulingService ────────────────────────────────────────────────────────

describe('SchedulingService', () => {
  let service: SchedulingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = SchedulingService.getInstance();
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
  });

  it('generateDailySchedule creates schedule with slots', async () => {
    const avail = {
      availabilityId: 'avail-1',
      providerId: 'doctor-1',
      providerName: 'Dr. Test',
      facilityId: 'facility-1',
      dayOfWeek: 5,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      bufferMinutes: 0,
      isAvailable: true,
    };
    vi.mocked(getDocs).mockResolvedValue({ docs: [{ data: () => avail }] } as never);

    const schedule = await service.generateDailySchedule('doctor-1', 'Dr. Test', 'facility-1', '2026-07-10');
    expect(schedule.slots.length).toBeGreaterThan(0);
    expect(schedule.providerId).toBe('doctor-1');
  });

  it('generateDailySchedule throws when no availability', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
    await expect(
      service.generateDailySchedule('doctor-1', 'Dr. Test', 'facility-1', '2026-07-10'),
    ).rejects.toThrow();
  });

  it('generateWeeklySchedule returns schedules', async () => {
    const avail = {
      availabilityId: 'avail-1',
      providerId: 'doctor-1',
      providerName: 'Dr. Test',
      facilityId: 'facility-1',
      dayOfWeek: 5,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      bufferMinutes: 0,
      isAvailable: true,
    };
    vi.mocked(getDocs).mockResolvedValue({ docs: [{ data: () => avail }] } as never);

    const schedules = await service.generateWeeklySchedule('doctor-1', 'Dr. Test', 'facility-1', '2026-07-06');
    expect(schedules.length).toBeGreaterThan(0);
  });

  it('reserveSlot marks slot unavailable', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        scheduleId: 'sched-1',
        slots: [{
          slotId: 'slot-1',
          isAvailable: true,
          startTime: '09:00',
          endTime: '09:30',
          durationMinutes: 30,
          facilityId: 'facility-1',
          providerId: 'doctor-1',
          providerName: 'Dr. Test',
          date: '2026-07-10',
        }],
        isActive: true,
      }),
    } as never);
    await service.reserveSlot('slot-1', 'sched-1');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('releaseSlot marks slot available', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        scheduleId: 'sched-1',
        slots: [{
          slotId: 'slot-1',
          isAvailable: false,
          startTime: '09:00',
          endTime: '09:30',
          durationMinutes: 30,
          facilityId: 'facility-1',
          providerId: 'doctor-1',
          providerName: 'Dr. Test',
          date: '2026-07-10',
        }],
        isActive: true,
      }),
    } as never);
    await service.releaseSlot('slot-1', 'sched-1');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('getDailySchedule returns schedule for provider/date', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ scheduleId: 'sched-1' }) }],
    } as never);
    const result = await service.getDailySchedule('doctor-1', '2026-07-10');
    expect(result).not.toBeNull();
  });

  it('getWeeklySchedule returns schedules for week', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
    const result = await service.getWeeklySchedule('doctor-1', '2026-07-06');
    expect(result).toEqual([]);
  });
});

// ─── WaitingListService ───────────────────────────────────────────────────────

describe('WaitingListService', () => {
  let service: WaitingListService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = WaitingListService.getInstance();
  });

  it('joinWaitingList creates entry', async () => {
    const id = await service.joinWaitingList(
      'patient-1', 'Test Patient', 'phone-1', 'GENERAL_CONSULTATION', '2026-07-10', 'ROUTINE',
    );
    expect(id).toBeTruthy();
    expect(setDoc).toHaveBeenCalled();
  });

  it('removeFromWaitingList updates status to cancelled', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        entryId: 'entry-1',
        patientId: 'patient-1',
        status: 'waiting',
      }),
    } as never);
    await service.removeFromWaitingList('entry-1');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('promoteEntry updates status to scheduled', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        entryId: 'entry-1',
        patientId: 'patient-1',
        patientName: 'Test',
        status: 'waiting',
      }),
    } as never);
    await service.promoteEntry('entry-1', 'slot-1', 'apt-1');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('getNextInQueue returns first entry', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ data: () => ({ entryId: 'entry-1', patientId: 'patient-1' }) }],
    } as never);
    const result = await service.getNextInQueue('GENERAL_CONSULTATION');
    expect(result).not.toBeNull();
  });

  it('processExpiredEntries expires outdated entries', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
    const count = await service.processExpiredEntries();
    expect(count).toBe(0);
  });

  it('getPatientEntries returns patient entries', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);
    const result = await service.getPatientEntries('patient-1');
    expect(result).toEqual([]);
  });
});

// ─── FollowUpService ──────────────────────────────────────────────────────────

describe('FollowUpService', () => {
  let service: FollowUpService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = FollowUpService.getInstance();
  });

  it('getSuggestedInterval returns interval for known type', () => {
    const result = service.getSuggestedInterval('GENERAL_CONSULTATION');
    expect(result.recommendedIntervalDays).toBe(14);
  });

  it('getSuggestedInterval returns default for unknown type', () => {
    const result = service.getSuggestedInterval('HOME_VISIT');
    expect(result.recommendedIntervalDays).toBeGreaterThan(0);
  });

  it('createFollowUp throws on missing original', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
    await expect(
      service.createFollowUp('nonexistent', '2026-08-10', 'doctor-1', 'Routine check', 'patient-1', 'doctor', mockOrigin),
    ).rejects.toThrow(AppointmentNotFoundError);
  });

  it('getFollowUpHistory returns follow-ups from appointments', async () => {
    const apt = makeAppointment({ appointmentType: 'FOLLOW_UP', status: 'SCHEDULED' });
    vi.mocked(getDocs).mockResolvedValue({ docs: [{ data: () => apt }] } as never);
    const result = await service.getFollowUpHistory('patient-1');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('scheduled');
  });
});

// ─── TimelineIntegrationService ───────────────────────────────────────────────

describe('TimelineIntegrationService', () => {
  let eventBus: AppointmentEventBus;

  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = AppointmentEventBus.getInstance();
    eventBus.reset();
    TimelineIntegrationService.getInstance();
  });

  it('event bus publish triggers timeline updates', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as never);

    await eventBus.publish('AppointmentCreated', {
      appointment: makeAppointment(),
      createdBy: 'user-1',
      timestamp: new Date(),
    });

    expect(setDoc).toHaveBeenCalled();
  });

  it('publishes AppointmentCancelled event', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as never);

    await eventBus.publish('AppointmentCancelled', {
      appointmentId: 'apt-1',
      patientId: 'patient-1',
      cancelledBy: 'user-1',
      reason: 'test',
      timestamp: new Date(),
    });
  });

  it('publishes AppointmentRescheduled event', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as never);

    await eventBus.publish('AppointmentRescheduled', {
      appointmentId: 'apt-1',
      patientId: 'patient-1',
      previousDate: '2026-07-10',
      newDate: '2026-07-15',
      rescheduledBy: 'user-1',
      timestamp: new Date(),
    });
  });

  it('publishes AppointmentNoShow event', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({}),
    } as never);

    await eventBus.publish('AppointmentNoShow', {
      appointmentId: 'apt-1',
      patientId: 'patient-1',
      scheduledDate: '2026-07-10',
      timestamp: new Date(),
    });
  });
});

// ─── Event Bus ────────────────────────────────────────────────────────────────

describe('AppointmentEventBus', () => {
  beforeEach(() => {
    AppointmentEventBus.getInstance().reset();
  });

  it('subscribe and publish delivers events', async () => {
    const bus = AppointmentEventBus.getInstance();
    const handler = vi.fn();
    bus.subscribe('AppointmentCreated', handler);
    await bus.publish('AppointmentCreated', {
      appointment: makeAppointment(),
      createdBy: 'user-1',
      timestamp: new Date(),
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe removes listener', async () => {
    const bus = AppointmentEventBus.getInstance();
    const handler = vi.fn();
    const unsub = bus.subscribe('AppointmentCreated', handler);
    unsub();
    await bus.publish('AppointmentCreated', {
      appointment: makeAppointment(),
      createdBy: 'user-1',
      timestamp: new Date(),
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('listener errors are isolated', async () => {
    const bus = AppointmentEventBus.getInstance();
    const errorHandler = vi.fn(() => { throw new Error('fail'); });
    const goodHandler = vi.fn();
    bus.subscribe('AppointmentCreated', errorHandler);
    bus.subscribe('AppointmentCreated', goodHandler);
    await bus.publish('AppointmentCreated', {
      appointment: makeAppointment(),
      createdBy: 'user-1',
      timestamp: new Date(),
    });
    expect(goodHandler).toHaveBeenCalledTimes(1);
  });

  it('publish with no listeners does nothing', async () => {
    const bus = AppointmentEventBus.getInstance();
    await bus.publish('AppointmentCreated', {
      appointment: makeAppointment(),
      createdBy: 'user-1',
      timestamp: new Date(),
    });
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('AppointmentSchema validation', () => {
  it('validates a correct appointment', () => {
    const result = AppointmentSchema.safeParse(makeAppointment());
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = AppointmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = AppointmentSchema.safeParse(makeAppointment({ status: 'INVALID' as never }));
    expect(result.success).toBe(false);
  });

  it('rejects invalid appointment type', () => {
    const result = AppointmentSchema.safeParse(makeAppointment({ appointmentType: 'INVALID' as never }));
    expect(result.success).toBe(false);
  });

  it('rejects negative duration', () => {
    const result = AppointmentSchema.safeParse(makeAppointment({ durationMinutes: -5 } as never));
    expect(result.success).toBe(false);
  });
});

// ─── Errors ───────────────────────────────────────────────────────────────────

describe('AppointmentsDomainError', () => {
  it('AppointmentNotFoundError has correct code', () => {
    const err = new AppointmentNotFoundError('apt-1');
    expect(err.message).toContain('apt-1');
    expect(err.code).toBe('APPOINTMENT_NOT_FOUND');
  });

  it('InvalidAppointmentStateError has correct message', () => {
    const err = new InvalidAppointmentStateError('apt-1', 'CANCELLED', 'SCHEDULED');
    expect(err.message).toContain('CANCELLED');
    expect(err.message).toContain('SCHEDULED');
  });

  it('DoubleBookingError has correct code', () => {
    const err = new DoubleBookingError('doctor-1', '2026-07-10', '09:00');
    expect(err.code).toBe('DOUBLE_BOOKING');
  });
});

// ─── Enterprise: Cache ────────────────────────────────────────────────────────

describe('AppointmentCache', () => {
  it('appointmentListCache set/get/expire', async () => {
    const { appointmentListCache } = await import('./enterprise/AppointmentCache');
    appointmentListCache.clear();
    appointmentListCache.set('patient-1', [{ id: '1' } as never], 50_000);
    expect(appointmentListCache.get('patient-1')).toBeDefined();
    appointmentListCache.clear();
    expect(appointmentListCache.get('patient-1')).toBeUndefined();
  });

  it('invalidateAppointmentCaches clears by prefix', async () => {
    const { appointmentListCache, invalidateAppointmentCaches } = await import('./enterprise/AppointmentCache');
    appointmentListCache.set('patient-1:list', []);
    invalidateAppointmentCaches('patient-1');
    expect(appointmentListCache.get('patient-1:list' as never)).toBeUndefined();
  });
});

// ─── Enterprise: Retry ────────────────────────────────────────────────────────

describe('AppointmentRetry', () => {
  it('appointmentRetry succeeds on first attempt', async () => {
    const { appointmentRetry } = await import('./enterprise/AppointmentRetry');
    const result = await appointmentRetry(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('appointmentRetry retries on failure', async () => {
    const { appointmentRetry } = await import('./enterprise/AppointmentRetry');
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValueOnce('ok');
    const result = await appointmentRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('appointmentAggressiveRetry uses 5 max attempts', async () => {
    const { appointmentAggressiveRetry } = await import('./enterprise/AppointmentRetry');
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(appointmentAggressiveRetry(fn)).rejects.toThrow();
    expect(fn.mock.calls.length).toBeLessThanOrEqual(5);
  });

  it('createAbortSignal creates abortable signal', async () => {
    const { createAbortSignal } = await import('./enterprise/AppointmentRetry');
    const { signal, cleanup } = createAbortSignal(10_000);
    expect(signal).toBeInstanceOf(AbortSignal);
    cleanup();
  });
});

// ─── Enterprise: Observability ────────────────────────────────────────────────

describe('AppointmentObservability', () => {
  it('tracks creation operations', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackCreation(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('tracks confirmation operations', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    await expect(
      appointmentObservability.trackConfirmation(() => Promise.reject(new Error('fail'))),
    ).rejects.toThrow('fail');
  });

  it('tracks cancellation with metadata', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackCancellation(
      () => Promise.resolve('cancelled'),
      { reasonCode: 'patient_request' },
    );
    expect(result).toBe('cancelled');
  });

  it('tracks reschedule operations', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackReschedule(() => Promise.resolve('rescheduled'));
    expect(result).toBe('rescheduled');
  });

  it('tracks check-in operations', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackCheckIn(() => Promise.resolve('checked-in'));
    expect(result).toBe('checked-in');
  });

  it('tracks completion operations', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackCompletion(() => Promise.resolve('completed'));
    expect(result).toBe('completed');
  });

  it('tracks calendar load', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackCalendarLoad(() => Promise.resolve([]));
    expect(result).toEqual([]);
  });

  it('tracks availability load', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackAvailabilityLoad(() => Promise.resolve([]));
    expect(result).toEqual([]);
  });

  it('tracks waiting list processing', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackWaitingListProcessing(() => Promise.resolve(5));
    expect(result).toBe(5);
  });

  it('tracks statistics load', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackStatisticsLoad(() => Promise.resolve([]));
    expect(result).toEqual([]);
  });

  it('tracks follow-up load', async () => {
    const { appointmentObservability } = await import('./enterprise/AppointmentObservability');
    const result = await appointmentObservability.trackFollowUpLoad(() => Promise.resolve([]));
    expect(result).toEqual([]);
  });
});

// ─── Enterprise: Offline Service ──────────────────────────────────────────────

describe('AppointmentOfflineService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enqueue adds operation to queue', async () => {
    const { appointmentOfflineService, APPOINTMENT_OPERATIONS } = await import('./enterprise/AppointmentOfflineService');
    localStorage.clear();
    appointmentOfflineService.enqueue(APPOINTMENT_OPERATIONS.CREATE, 'apt-1', 'patient-1');
    const pending = appointmentOfflineService.getPendingOperations();
    expect(pending).toHaveLength(1);
    expect(pending[0].appointmentId).toBe('apt-1');
  });

  it('dequeue removes operation from queue', async () => {
    const { appointmentOfflineService, APPOINTMENT_OPERATIONS } = await import('./enterprise/AppointmentOfflineService');
    localStorage.clear();
    appointmentOfflineService.enqueue(APPOINTMENT_OPERATIONS.UPDATE, 'apt-1', 'patient-1');
    const pending = appointmentOfflineService.getPendingOperations();
    expect(pending).toHaveLength(1);
    appointmentOfflineService.dequeue(pending[0].queueId);
    expect(appointmentOfflineService.hasPendingOperations()).toBe(false);
  });

  it('deduplicates identical queue entries', async () => {
    const { appointmentOfflineService, APPOINTMENT_OPERATIONS } = await import('./enterprise/AppointmentOfflineService');
    localStorage.clear();
    appointmentOfflineService.enqueue(APPOINTMENT_OPERATIONS.CANCEL, 'apt-1', 'patient-1');
    appointmentOfflineService.enqueue(APPOINTMENT_OPERATIONS.CANCEL, 'apt-1', 'patient-1');
    const pending = appointmentOfflineService.getPendingOperations();
    expect(pending).toHaveLength(1);
  });

  it('enqueue writes to storage and dequeue removes', async () => {
    const { appointmentOfflineService, APPOINTMENT_OPERATIONS } = await import('./enterprise/AppointmentOfflineService');
    localStorage.clear();
    appointmentOfflineService.enqueue(APPOINTMENT_OPERATIONS.CHECK_IN, 'apt-1', 'patient-1');
    const before = appointmentOfflineService.getPendingOperations();
    expect(before).toHaveLength(1);
    appointmentOfflineService.dequeue(before[0].queueId);
    expect(appointmentOfflineService.getPendingOperations()).toHaveLength(0);
  });

  it('has getConnectionStatus delegate', async () => {
    const { appointmentOfflineService } = await import('./enterprise/AppointmentOfflineService');
    expect(appointmentOfflineService).toHaveProperty('isOnline');
    expect(typeof appointmentOfflineService.onConnectionChange).toBe('function');
  });

  it('processPendingQueue with empty queue is no-op', async () => {
    const { appointmentOfflineService } = await import('./enterprise/AppointmentOfflineService');
    localStorage.clear();
    const executor = vi.fn().mockResolvedValue(undefined);
    await appointmentOfflineService.processPendingQueue(executor);
    expect(executor).not.toHaveBeenCalled();
  });
});

// ─── Enterprise: Audit Events ─────────────────────────────────────────────────

describe('AppointmentAuditEvents', () => {
  it('defines all audit actions', async () => {
    const { APPOINTMENT_AUDIT_ACTIONS } = await import('./enterprise/AppointmentAuditEvents');
    expect(APPOINTMENT_AUDIT_ACTIONS.APPOINTMENT_CREATED).toBe('APPOINTMENT_CREATED');
    expect(APPOINTMENT_AUDIT_ACTIONS.APPOINTMENT_CANCELLED).toBe('APPOINTMENT_CANCELLED');
    expect(APPOINTMENT_AUDIT_ACTIONS.APPOINTMENT_RESCHEDULED).toBe('APPOINTMENT_RESCHEDULED');
    expect(APPOINTMENT_AUDIT_ACTIONS.WAITING_LIST_JOINED).toBe('WAITING_LIST_JOINED');
    expect(APPOINTMENT_AUDIT_ACTIONS.WAITING_LIST_PROMOTED).toBe('WAITING_LIST_PROMOTED');
    expect(Object.keys(APPOINTMENT_AUDIT_ACTIONS)).toHaveLength(8);
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe('Accessibility utilities', () => {
  beforeEach(() => {
    if (typeof document !== 'undefined') {
      const existing = document.getElementById('apt-aria-live');
      if (existing) existing.remove();
    }
  });

  it('announceToScreenReader creates aria-live region', async () => {
    const { announceToScreenReader } = await import('./utils/accessibility');
    announceToScreenReader('Test announcement');
    const region = document.getElementById('apt-aria-live');
    expect(region).not.toBeNull();
    expect(region!.getAttribute('aria-live')).toBe('polite');
    expect(region!.getAttribute('role')).toBe('status');
  });

  it('focusElement focuses by id', async () => {
    const { focusElement } = await import('./utils/accessibility');
    const el = document.createElement('div');
    el.id = 'test-focus';
    document.body.appendChild(el);
    focusElement('test-focus');
    expect(document.activeElement).toBe(el);
    el.remove();
  });

  it('restoreFocus restores previous active element', async () => {
    const { restoreFocus } = await import('./utils/accessibility');
    const prev = document.createElement('button');
    document.body.appendChild(prev);
    prev.focus();
    const newEl = document.createElement('button');
    document.body.appendChild(newEl);
    newEl.focus();
    restoreFocus(prev);
    expect(document.activeElement).toBe(prev);
    prev.remove();
    newEl.remove();
  });

  it('getTrapFocusHandler returns handler function', async () => {
    const { getTrapFocusHandler } = await import('./utils/accessibility');
    const handler = getTrapFocusHandler('nonexistent');
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    expect(() => handler(event)).not.toThrow();
  });

  it('getAriaAnnouncementForStatusChange returns readable string', async () => {
    const { getAriaAnnouncementForStatusChange } = await import('./utils/accessibility');
    const msg = getAriaAnnouncementForStatusChange('apt-123456', 'SCHEDULED', 'CONFIRMED');
    expect(msg).toContain('23456');
    expect(msg).toContain('scheduled');
    expect(msg).toContain('confirmed');
  });

  it('A11Y_STATUS maps all statuses', async () => {
    const { A11Y_STATUS } = await import('./utils/accessibility');
    expect(A11Y_STATUS.SCHEDULED).toBe('Scheduled');
    expect(A11Y_STATUS.CANCELLED).toBe('Cancelled');
    expect(A11Y_STATUS.NO_SHOW).toBe('No show');
    expect(Object.keys(A11Y_STATUS)).toHaveLength(8);
  });

  it('createKeyboardNavigator handles arrow keys', async () => {
    const { createKeyboardNavigator } = await import('./utils/accessibility');
    const items = ['a', 'b', 'c'];
    const onActivate = vi.fn();
    const handler = createKeyboardNavigator(items, onActivate);

    const event = { key: 'Enter', preventDefault: vi.fn() } as never;
    handler(event as React.KeyboardEvent, 1);
    expect(onActivate).toHaveBeenCalledWith('b', 1);
  });
});

// ─── Constants ────────────────────────────────────────────────────────────────

describe('Appointment constants', () => {
  it('APPOINTMENT_STATUS has all statuses', async () => {
    const { APPOINTMENT_STATUS } = await import('./core/constants');
    expect(APPOINTMENT_STATUS.SCHEDULED).toBe('SCHEDULED');
    expect(APPOINTMENT_STATUS.NO_SHOW).toBe('NO_SHOW');
  });

  it('APPOINTMENT_TYPE has all types', async () => {
    const { APPOINTMENT_TYPE } = await import('./core/constants');
    expect(APPOINTMENT_TYPE.GENERAL_CONSULTATION).toBe('GENERAL_CONSULTATION');
    expect(APPOINTMENT_TYPE.TELEMEDICINE).toBe('TELEMEDICINE');
  });

  it('BOOKING_CONSTRAINTS has expected values', async () => {
    const { BOOKING_CONSTRAINTS } = await import('./core/constants');
    expect(BOOKING_CONSTRAINTS.MAX_ADVANCE_DAYS).toBe(90);
    expect(BOOKING_CONSTRAINTS.RESCHEDULE_LIMIT).toBe(3);
  });
});

// ─── Cleanup after all tests ──────────────────────────────────────────────────
