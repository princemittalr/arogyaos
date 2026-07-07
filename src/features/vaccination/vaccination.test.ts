import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDoc, updateDoc, setDoc, getDocs, runTransaction } from 'firebase/firestore';

vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
  cb(0);
  return 0;
}));

vi.mock('@/firebase/client', () => ({ db: { type: 'mock-db' } }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db: unknown, name: string) => ({ type: 'collection', name })),
  doc: vi.fn((_db: unknown, path: string, ...segments: string[]) => ({ type: 'document', path, segments })),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn((q: unknown) => q),
  where: vi.fn((field: string, op: string, val: unknown) => ({ type: 'where', field, op, val })),
  orderBy: vi.fn((field: string, dir: string) => ({ type: 'orderBy', field, dir })),
  Timestamp: { now: () => 'mock-timestamp-now', fromDate: (d: Date) => d },
  runTransaction: vi.fn(async (_db: unknown, cb: (tx: unknown) => Promise<void>) => {
    const tx = {
      get: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
      set: vi.fn(),
      update: vi.fn(),
    };
    await cb(tx);
  }),
  serverTimestamp: () => 'mock-server-timestamp',
  limit: vi.fn((n: number) => ({ type: 'limit', n })),
  startAfter: vi.fn((snap: unknown) => ({ type: 'startAfter', snap })),
}));

const { mockIngestRecord } = vi.hoisted(() => ({
  mockIngestRecord: vi.fn(() => Promise.resolve('rec_test_001')),
}));

vi.mock('@/features/health-vault/services/HealthVaultService', () => ({
  HealthVaultService: class {
    ingestRecord = mockIngestRecord;
    archiveRecord = vi.fn().mockResolvedValue(undefined);
    restoreRecord = vi.fn().mockResolvedValue(undefined);
  },
}));

import { VaccinationEventBus } from './core/events';
import { VaccinationService } from './services/VaccinationService';
import { ScheduleService } from './services/ScheduleService';
import { CertificateGenerationService } from './services/CertificateGenerationService';
import { BoosterService } from './services/BoosterService';
import { TimelineIntegrationService } from './services/TimelineIntegrationService';
import * as CACHE from './services/VaccinationCache';
import * as OBS from './services/VaccinationObservability';
import * as RETRY from './services/VaccinationRetry';
import * as ACCESS from './utils/accessibility';
import * as VALID from './utils/validations';
import {
  VaccinationNotFoundError,
  DuplicateVaccinationError,
  ScheduleValidationError,
  CertificateGenerationError,
  BoosterNotDueError,
  InvalidDoseError,
  UnauthorizedVaccinationAccessError,
} from './core/errors';
import {
  VACCINATION_STATUS,
  VACCINATION_CATEGORY,
  ADMINISTRATION_ROUTES,
  ADMINISTRATION_SITES,
  CERTIFICATE_TYPES,
  SEVERITY_LEVELS,
  DEFAULT_CONFIG,
} from './core/constants';

const PATIENT_ID = 'pat_test_001';
const VAC_ID = 'vac_test_001';
const OWNER_ID = PATIENT_ID;

function makeExistsSnap(data: Record<string, unknown>) {
  return { exists: () => true, data: () => data };
}

function makeEmptySnap() {
  return { exists: () => false, data: () => ({}) };
}

function makeBaseRecord(overrides?: Record<string, unknown>) {
  return {
    recordId: VAC_ID,
    ownerId: OWNER_ID,
    vaccinationId: VAC_ID,
    patientId: PATIENT_ID,
    patientName: 'Test Patient',
    vaccineName: 'Tetanus Toxoid',
    diseaseTargeted: 'Tetanus',
    category: 'ADULT' as const,
    status: 'ADMINISTERED' as const,
    doseNumber: 1,
    totalDoses: 3,
    administeredAt: new Date('2025-01-15'),
    administeredBy: 'Dr. Test',
    facilityId: 'fac_001',
    facilityName: 'Test Hospital',
    batchNumber: 'BATCH-001',
    lotNumber: 'LOT-001',
    manufacturer: 'TestPharma',
    expiryDate: new Date('2026-01-15'),
    nextDueDate: new Date('2025-04-15'),
    administrationRoute: 'INTRAMUSCULAR' as const,
    administrationSite: 'LEFT_DELTOID' as const,
    notes: 'Test notes',
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Dr. Test',
      updatedBy: 'Dr. Test',
      version: 1,
      status: 'ACTIVE' as const,
      source: 'provider' as const,
      ownerId: OWNER_ID,
      origin: {
        deviceId: 'dev-001',
        deviceType: 'Desktop',
        platform: 'ArogyaOS',
        browser: 'test',
        appVersion: '1.0.0',
      },
      verification: { isVerified: false },
      interoperability: {
        resourceType: 'Immunization' as const,
        fhirVersion: 'R4B',
        hashAlgorithm: 'SHA-256',
        checksumVersion: '1.0.0',
      },
      checksum: 'mock-checksum',
    },
    ...overrides,
  };
}

describe('Module 6 – Vaccination Enterprise Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    VaccinationEventBus.getInstance().reset();
  });

  // ─── 1. Constants ───────────────────────────────────────────────────────
  describe('Constants', () => {
    it('should define valid vaccination statuses', () => {
      expect(VACCINATION_STATUS.SCHEDULED).toBe('SCHEDULED');
      expect(VACCINATION_STATUS.ADMINISTERED).toBe('ADMINISTERED');
      expect(VACCINATION_STATUS.VERIFIED).toBe('VERIFIED');
      expect(VACCINATION_STATUS.CANCELLED).toBe('CANCELLED');
      expect(Object.keys(VACCINATION_STATUS)).toHaveLength(9);
    });

    it('should define vaccination categories', () => {
      expect(VACCINATION_CATEGORY.CHILDHOOD).toBe('CHILDHOOD');
      expect(VACCINATION_CATEGORY.COVID).toBe('COVID');
      expect(Object.keys(VACCINATION_CATEGORY)).toHaveLength(10);
    });

    it('should define administration routes', () => {
      expect(ADMINISTRATION_ROUTES.INTRAMUSCULAR).toBe('INTRAMUSCULAR');
      expect(Object.keys(ADMINISTRATION_ROUTES)).toHaveLength(5);
    });

    it('should define administration sites', () => {
      expect(ADMINISTRATION_SITES.LEFT_DELTOID).toBe('LEFT_DELTOID');
      expect(Object.keys(ADMINISTRATION_SITES)).toHaveLength(9);
    });

    it('should define certificate types', () => {
      expect(CERTIFICATE_TYPES.IMMUNIZATION_CERTIFICATE).toBe('IMMUNIZATION_CERTIFICATE');
      expect(Object.keys(CERTIFICATE_TYPES)).toHaveLength(4);
    });

    it('should define severity levels', () => {
      expect(SEVERITY_LEVELS.MILD).toBe('MILD');
      expect(SEVERITY_LEVELS.SEVERE).toBe('SEVERE');
    });

    it('should define default configuration', () => {
      expect(DEFAULT_CONFIG.REMINDER_DAYS_BEFORE_DUE).toBe(7);
      expect(DEFAULT_CONFIG.MAX_DOSE_NUMBER).toBe(10);
    });
  });

  // ─── 2. Domain Errors ────────────────────────────────────────────────────
  describe('Domain Errors', () => {
    it('VaccinationNotFoundError should have correct code', () => {
      const err = new VaccinationNotFoundError('vac_001');
      expect(err.message).toContain('vac_001');
      expect(err.code).toBe('VACCINATION_NOT_FOUND');
      expect(err).toBeInstanceOf(Error);
    });

    it('DuplicateVaccinationError should have correct code', () => {
      const err = new DuplicateVaccinationError('pat_1', 'BCG', 1);
      expect(err.code).toBe('DUPLICATE_VACCINATION');
      expect(err.message).toContain('BCG');
    });

    it('InvalidDoseError should have correct code', () => {
      const err = new InvalidDoseError('vac_1', 5, 3);
      expect(err.code).toBe('INVALID_DOSE');
      expect(err.message).toContain('5');
    });

    it('BoosterNotDueError should have correct code', () => {
      const err = new BoosterNotDueError('vac_1', '2026-01-01');
      expect(err.code).toBe('BOOSTER_NOT_DUE');
    });

    it('ScheduleValidationError should have correct code', () => {
      const err = new ScheduleValidationError('Invalid interval');
      expect(err.code).toBe('SCHEDULE_VALIDATION_ERROR');
    });

    it('CertificateGenerationError should have correct code', () => {
      const err = new CertificateGenerationError('vac_1', 'PDF failed');
      expect(err.code).toBe('CERTIFICATE_GENERATION_FAILED');
    });

    it('UnauthorizedVaccinationAccessError should have correct code', () => {
      const err = new UnauthorizedVaccinationAccessError('user_1', 'vac_1');
      expect(err.code).toBe('UNAUTHORIZED_VACCINATION_ACCESS');
    });
  });

  // ─── 3. Event Bus ────────────────────────────────────────────────────────
  describe('VaccinationEventBus', () => {
    it('should subscribe and publish VaccinationScheduled events', async () => {
      const bus = VaccinationEventBus.getInstance();
      const received: unknown[] = [];
      bus.subscribe('VaccinationScheduled', (p) => { received.push(p); });

      await bus.publish('VaccinationScheduled', {
        schedule: { scheduleId: 's1', patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB', category: 'CHILDHOOD', status: 'SCHEDULED', dueDate: new Date(), scheduledDate: new Date(), doseNumber: 1, totalDoses: 1, metadata: makeBaseRecord().metadata },
        scheduledBy: 'Dr. A',
        timestamp: new Date(),
      });
      expect(received).toHaveLength(1);
    });

    it('should publish and receive all 8 event types', async () => {
      const bus = VaccinationEventBus.getInstance();
      const events: string[] = [];
      const record = makeBaseRecord() as Parameters<typeof bus.subscribe>[1] extends (p: any) => void ? any : never;

      bus.subscribe('VaccinationAdministered', () => { events.push('administered'); });
      bus.subscribe('VaccinationVerified', () => { events.push('verified'); });
      bus.subscribe('BoosterDue', () => { events.push('booster'); });
      bus.subscribe('CertificateGenerated', () => { events.push('cert'); });
      bus.subscribe('AdverseEventRecorded', () => { events.push('ae'); });
      bus.subscribe('VaccinationArchived', () => { events.push('archived'); });
      bus.subscribe('VaccinationRestored', () => { events.push('restored'); });

      await bus.publish('VaccinationAdministered', { vaccination: record, administeredBy: 'Dr. A', timestamp: new Date() });
      await bus.publish('VaccinationVerified', { vaccinationId: VAC_ID, verifiedBy: 'Dr. A', timestamp: new Date() });
      await bus.publish('BoosterDue', { booster: {} as any, patientId: PATIENT_ID, vaccineName: 'BCG', dueDate: new Date(), timestamp: new Date() });
      await bus.publish('CertificateGenerated', { certificate: {} as any, generatedBy: 'Dr. A', timestamp: new Date() });
      await bus.publish('AdverseEventRecorded', { vaccinationId: VAC_ID, adverseEvent: {} as any, recordedBy: 'Dr. A', timestamp: new Date() });
      await bus.publish('VaccinationArchived', { vaccinationId: VAC_ID, archivedBy: 'Dr. A', timestamp: new Date() });
      await bus.publish('VaccinationRestored', { vaccinationId: VAC_ID, restoredBy: 'Dr. A', timestamp: new Date() });

      expect(events).toEqual(['administered', 'verified', 'booster', 'cert', 'ae', 'archived', 'restored']);
    });

    it('should isolate subscriber errors', async () => {
      const bus = VaccinationEventBus.getInstance();
      const succeeded: unknown[] = [];
      bus.subscribe('VaccinationAdministered', () => { throw new Error('fail'); });
      bus.subscribe('VaccinationAdministered', (p) => { succeeded.push(p); });

      await expect(bus.publish('VaccinationAdministered', { vaccination: makeBaseRecord() as any, administeredBy: 'Dr. A', timestamp: new Date() })).resolves.not.toThrow();
      expect(succeeded).toHaveLength(1);
    });

    it('should unsubscribe correctly', async () => {
      const bus = VaccinationEventBus.getInstance();
      const received: unknown[] = [];
      const unsub = bus.subscribe('VaccinationScheduled', (p) => { received.push(p); });
      unsub();
      await bus.publish('VaccinationScheduled', { schedule: {} as any, scheduledBy: '', timestamp: new Date() });
      expect(received).toHaveLength(0);
    });

    it('should reset all listeners', async () => {
      const bus = VaccinationEventBus.getInstance();
      const fn = vi.fn();
      bus.subscribe('VaccinationScheduled', fn);
      bus.reset();
      await bus.publish('VaccinationScheduled', { schedule: {} as any, scheduledBy: '', timestamp: new Date() });
      expect(fn).not.toHaveBeenCalled();
    });
  });

  // ─── 4. Validation Schemas ──────────────────────────────────────────────
  describe('Validation Schemas', () => {
    it('should validate a correct VaccinationRecord', () => {
      const result = VALID.VaccinationRecordSchema.safeParse(makeBaseRecord());
      expect(result.success).toBe(true);
    });

    it('should reject VaccinationRecord with missing required fields', () => {
      const result = VALID.VaccinationRecordSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should validate adverse event schema', () => {
      const result = VALID.AdverseEventSchema.safeParse({
        reportedAt: new Date(),
        reportedBy: 'Dr. R',
        symptoms: ['Fever', 'Rash'],
        severity: 'MODERATE',
        reporterName: 'Dr. Reporter',
        isReportedToAuthority: false,
      });
      expect(result.success).toBe(true);
    });

    it('should reject adverse event without symptoms', () => {
      const result = VALID.AdverseEventSchema.safeParse({
        reportedAt: new Date(),
        reportedBy: 'Dr. R',
        symptoms: [],
        severity: 'MILD',
        reporterName: 'Dr. R',
        isReportedToAuthority: false,
      });
      expect(result.success).toBe(false);
    });

    it('should validate schedule schema', () => {
      const result = VALID.ScheduleSchema.safeParse({
        scheduleId: 's1', patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB',
        category: 'CHILDHOOD', status: 'SCHEDULED', dueDate: new Date(), scheduledDate: new Date(),
        doseNumber: 1, totalDoses: 1,
        metadata: makeBaseRecord().metadata,
      });
      expect(result.success).toBe(true);
    });

    it('should validate certificate schema', () => {
      const result = VALID.CertificateSchema.safeParse({
        certificateId: 'c1', vaccinationId: VAC_ID, certificateNumber: 'ARV-001', certificateType: 'IMMUNIZATION_CERTIFICATE',
        qrCodeData: 'qr-data', generatedAt: new Date(), generatedBy: 'Dr. A',
        patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB',
        doseNumber: 1, totalDoses: 1, administeredAt: new Date(), administeredBy: 'Dr. A',
        facilityName: 'Hosp', expiryDate: new Date(), isRevoked: false,
      });
      expect(result.success).toBe(true);
    });

    it('should validate booster schema', () => {
      const result = VALID.BoosterSchema.safeParse({
        boosterId: 'b1', originalVaccinationId: VAC_ID, patientId: PATIENT_ID, patientName: 'T',
        vaccineName: 'BCG', diseaseTargeted: 'TB', category: 'BOOSTER', doseNumber: 1, totalDoses: 1,
        dueDate: new Date(), status: 'DUE',
      });
      expect(result.success).toBe(true);
    });

    it('should validate timeline schema', () => {
      const result = VALID.TimelineSchema.safeParse({
        entryId: 'e1', vaccinationId: VAC_ID, patientId: PATIENT_ID, eventName: 'Vaccination Administered',
        eventType: 'administered', description: 'Dose given', timestamp: new Date(), performedBy: 'Dr. A',
      });
      expect(result.success).toBe(true);
    });

    it('should validate enum schemas', () => {
      expect(VALID.VaccinationStatusSchema.parse('ADMINISTERED')).toBe('ADMINISTERED');
      expect(VALID.VaccinationCategorySchema.parse('COVID')).toBe('COVID');
      expect(VALID.VaccinationCategorySchema.parse('ADULT')).toBe('ADULT');
      expect(() => VALID.VaccinationCategorySchema.parse('INVALID')).toThrow();
    });
  });

  // ─── 5. VaccinationService ──────────────────────────────────────────────
  describe('VaccinationService', () => {
    const service = VaccinationService.getInstance();

    it('should create a vaccination record and publish event', async () => {

      const received: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('VaccinationAdministered', (p) => { received.push(p); });

      const id = await service.createVaccination({
        patientId: PATIENT_ID, patientName: 'Test', vaccineName: 'Tetanus', diseaseTargeted: 'Tetanus',
        category: 'ADULT', doseNumber: 1, totalDoses: 3, administeredAt: new Date(), administeredBy: 'Dr. T',
        facilityId: 'f1', facilityName: 'Hosp', batchNumber: 'B1', lotNumber: 'L1', manufacturer: 'M',
        expiryDate: new Date('2026-01-01'), nextDueDate: new Date('2025-04-01'),
        administrationRoute: 'INTRAMUSCULAR', administrationSite: 'LEFT_DELTOID', notes: 'Test',
      }, {
        ownerId: OWNER_ID, createdBy: 'Dr. T', source: 'provider', encounterDate: new Date(),
        origin: { deviceId: '', deviceType: '', platform: '', browser: '', appVersion: '' },
        summaryFields: { title: '', providerName: '', hospitalName: '' },
      });

      expect(id).toBeDefined();
      expect(received).toHaveLength(1);
    });

    it('should throw DuplicateVaccinationError on duplicate', async () => {
      vi.mocked(runTransaction).mockImplementationOnce(async (_db, cb) => {
        await cb({
          get: vi.fn(() => Promise.resolve({ exists: () => true, data: () => makeBaseRecord(), id: 'mock-id', ref: {} as any } as any)),
          set: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        } as any);
      });

      await expect(service.createVaccination(
        { patientId: PATIENT_ID, patientName: 'T', vaccineName: 'Tetanus', diseaseTargeted: 'Tetanus', category: 'ADULT', doseNumber: 1, totalDoses: 3, administeredAt: new Date(), administeredBy: 'Dr. T', facilityId: 'f1', facilityName: 'H', batchNumber: 'B1', lotNumber: 'L1', manufacturer: 'M', expiryDate: new Date(), nextDueDate: new Date(), administrationRoute: 'INTRAMUSCULAR', administrationSite: 'LEFT_DELTOID' },
        { ownerId: OWNER_ID, createdBy: 'Dr. T', source: 'provider', encounterDate: new Date(), origin: { deviceId: '', deviceType: '', platform: '', browser: '', appVersion: '' }, summaryFields: { title: '', providerName: '', hospitalName: '' } },
      )).rejects.toThrow(DuplicateVaccinationError);
    });

    it('should throw VaccinationNotFoundError on getVaccination for missing record', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeEmptySnap() as never);
      await expect(service.getVaccination('invalid_id')).rejects.toThrow(VaccinationNotFoundError);
    });

    it('should throw VaccinationNotFoundError on update for missing record', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeEmptySnap() as never);
      await expect(service.updateVaccination('bad_id', { notes: 'update' }, { updatedBy: 'u', ownerId: 'o', actorRole: 'provider' })).rejects.toThrow(VaccinationNotFoundError);
    });

    it('should verify a vaccination and publish event', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(makeBaseRecord()) as never);
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      const received: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('VaccinationVerified', (p) => { received.push(p); });

      await service.verifyVaccination(VAC_ID, 'Dr. Verifier');
      expect(vi.mocked(updateDoc)).toHaveBeenCalled();
      expect(received).toHaveLength(1);
    });

    it('should throw VaccinationNotFoundError on verify for missing record', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeEmptySnap() as never);
      await expect(service.verifyVaccination('bad_id', 'Dr. V')).rejects.toThrow(VaccinationNotFoundError);
    });

    it('should archive and restore a vaccination', async () => {
      const record = makeBaseRecord();
      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(record) as never);
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      const archiveEvents: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('VaccinationArchived', (p) => { archiveEvents.push(p); });

      await service.archiveVaccination(VAC_ID, 'Dr. A', OWNER_ID);
      expect(archiveEvents).toHaveLength(1);

      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(record) as never);
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      const restoreEvents: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('VaccinationRestored', (p) => { restoreEvents.push(p); });

      await service.restoreVaccination(VAC_ID, 'Dr. R', OWNER_ID);
      expect(restoreEvents).toHaveLength(1);
    });

    it('should get vaccinations by patient', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [{ data: () => makeBaseRecord() }] } as any);
      const records = await service.getVaccinationsByPatient(PATIENT_ID);
      expect(records).toHaveLength(1);
      expect(records[0].vaccineName).toBe('Tetanus Toxoid');
    });

    it('should get vaccination history', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(makeBaseRecord({ metadata: { ...makeBaseRecord().metadata, version: 3 } })) as never);

      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(makeBaseRecord({ metadata: { ...makeBaseRecord().metadata, version: 1 } })) as never);
      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(makeBaseRecord({ metadata: { ...makeBaseRecord().metadata, version: 2 } })) as never);

      const history = await service.getHistory(VAC_ID);
      expect(history.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 6. ScheduleService ──────────────────────────────────────────────────
  describe('ScheduleService', () => {
    const scheduleService = ScheduleService.getInstance();

    it('should create a schedule and publish event', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      const received: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('VaccinationScheduled', (p) => { received.push(p); });

      const scheduleId = await scheduleService.createSchedule({
        patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB',
        category: 'CHILDHOOD', dueDate: new Date(), scheduledDate: new Date(), doseNumber: 1, totalDoses: 1,
      }, { ownerId: OWNER_ID, createdBy: 'Dr. S', encounterDate: new Date() });

      expect(scheduleId).toBeDefined();
      expect(vi.mocked(setDoc)).toHaveBeenCalled();
      expect(received).toHaveLength(1);
    });

    it('should throw ScheduleValidationError for invalid dose number', async () => {
      await expect(scheduleService.createSchedule({
        patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB',
        category: 'CHILDHOOD', dueDate: new Date(), scheduledDate: new Date(), doseNumber: 99, totalDoses: 1,
      }, { ownerId: OWNER_ID, createdBy: 'Dr. S', encounterDate: new Date() })).rejects.toThrow(ScheduleValidationError);
    });

    it('should calculate due dates', async () => {
      const vaccine = { vaccineId: 'v1', name: 'HepB', code: 'HEPB', diseaseTargeted: 'Hep B', category: 'ADULT' as const, manufacturer: 'M', totalDoses: 3, doseIntervalDays: [30, 180], administrationRoute: 'INTRAMUSCULAR' as const, administrationSite: 'LEFT_DELTOID' as const, isActive: true };
      const date1 = await scheduleService.calculateDueDate(vaccine, 1);
      expect(date1).toBeInstanceOf(Date);

      const date2 = await scheduleService.calculateDueDate(vaccine, 2);
      expect(date2.getTime()).toBeGreaterThan(date1.getTime());
    });
  });

  // ─── 7. CertificateGenerationService ─────────────────────────────────────
  describe('CertificateGenerationService', () => {
    const certService = CertificateGenerationService.getInstance();

    it('should throw VaccinationNotFoundError for missing vaccination', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeEmptySnap() as never);
      await expect(certService.generateCertificate('bad_id', 'Dr. G')).rejects.toThrow(VaccinationNotFoundError);
    });

    it('should return existing certificate if already generated', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(makeBaseRecord()) as never);
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [{ data: () => ({ certificateId: 'c1', vaccinationId: VAC_ID, certificateNumber: 'ARV-001' }) }], empty: false } as any);

      const cert = await certService.generateCertificate(VAC_ID, 'Dr. G');
      expect(cert.certificateId).toBe('c1');
    });

    it('should generate a new certificate with QR payload', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(makeBaseRecord()) as never);
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [], empty: true } as any);
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      const received: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('CertificateGenerated', (p) => { received.push(p); });

      const cert = await certService.generateCertificate(VAC_ID, 'Dr. G');
      expect(cert.certificateId).toBeDefined();
      expect(cert.certificateNumber).toMatch(/^ARV-/);
      expect(cert.qrCodeData).toContain('AROGYAOS_VACCINATION_CERTIFICATE');
      expect(cert.patientName).toBe('Test Patient');
      expect(cert.isRevoked).toBe(false);
      expect(received).toHaveLength(1);
    });

    it('should generate certificate ID in correct format', () => {
      const certId = certService.generateCertificateId();
      expect(certId).toMatch(/^ARV-/);
      expect(certId.length).toBeGreaterThan(8);
    });

    it('should generate QR payload with required fields', () => {
      const payload = JSON.parse(certService.generateQrPayload({ certificateNumber: 'ARV-001', vaccinationId: VAC_ID, patientId: PATIENT_ID, vaccineName: 'BCG' }));
      expect(payload.type).toBe('AROGYAOS_VACCINATION_CERTIFICATE');
      expect(payload.cert).toBe('ARV-001');
      expect(payload.vac).toBe(VAC_ID);
    });

    it('should return PDF metadata', () => {
      const cert = { certificateId: 'c1', vaccinationId: VAC_ID, certificateNumber: 'ARV-001', certificateType: 'IMMUNIZATION_CERTIFICATE' as const, qrCodeData: 'qr', generatedAt: new Date(), generatedBy: 'Dr. G', patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB', doseNumber: 1, totalDoses: 1, administeredAt: new Date(), administeredBy: 'Dr. A', facilityName: 'H', isRevoked: false, metadata: makeBaseRecord().metadata };
      const meta = certService.getPdfMetadata(cert as any);
      expect(meta.title).toContain('BCG');
      expect(meta.keywords).toContain('vaccination');
    });

    it('should return printable metadata', () => {
      const cert = { certificateId: 'c1', vaccinationId: VAC_ID, certificateNumber: 'ARV-001', certificateType: 'IMMUNIZATION_CERTIFICATE' as const, qrCodeData: 'qr', generatedAt: new Date(), generatedBy: 'Dr. G', patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB', doseNumber: 1, totalDoses: 1, administeredAt: new Date(), administeredBy: 'Dr. A', facilityName: 'H', isRevoked: false, metadata: makeBaseRecord().metadata };
      const meta = certService.getPrintableMetadata(cert as any);
      expect(meta.doseInfo).toBe('Dose 1 of 1');
      expect(meta.certificateNumber).toBe('ARV-001');
    });

    it('should get certificates by patient', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [{ data: () => ({ certificateId: 'c1' }) }] } as any);
      const certs = await certService.getCertificatesByPatient(PATIENT_ID);
      expect(certs).toHaveLength(1);
    });
  });

  // ─── 8. BoosterService ───────────────────────────────────────────────────
  describe('BoosterService', () => {
    const boosterService = BoosterService.getInstance();

    it('should return not eligible for incomplete series', async () => {
      const record = makeBaseRecord({ doseNumber: 1, totalDoses: 3 });
      const result = await boosterService.checkEligibility(record as any);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not complete');
    });

    it('should return eligible for completed series past due date', async () => {
      const oldDate = new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000);
      const record = makeBaseRecord({ doseNumber: 3, totalDoses: 3, administeredAt: oldDate, vaccineName: 'Tetanus Toxoid' });
      const result = await boosterService.checkEligibility(record as any);
      expect(result.eligible).toBe(true);
      expect(result.dueDate).toBeInstanceOf(Date);
    });

    it('should return not eligible for vaccines with no booster recommendation', async () => {
      const record = makeBaseRecord({ doseNumber: 1, totalDoses: 1, vaccineName: 'HPV' });
      const result = await boosterService.checkEligibility(record as any);
      expect(result.eligible).toBe(false);
    });

    it('should get booster history', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [{ data: () => makeBaseRecord({ doseNumber: 3, totalDoses: 3 }) }] } as any);
      const history = await boosterService.getBoosterHistory(PATIENT_ID);
      expect(Array.isArray(history)).toBe(true);
    });

    it('should get booster recommendations', async () => {
      const oldDate = new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000);
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [{ data: () => makeBaseRecord({ doseNumber: 3, totalDoses: 3, vaccineName: 'Tetanus Toxoid', administeredAt: oldDate }) }] } as any);
      const recs = await boosterService.getBoosterRecommendations(PATIENT_ID);
      expect(Array.isArray(recs)).toBe(true);
    });
  });

  // ─── 9. TimelineIntegrationService ───────────────────────────────────────
  describe('TimelineIntegrationService', () => {
    const timelineService = TimelineIntegrationService.getInstance();

    it('should publish vaccination scheduled to timeline', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);
      const schedule = { scheduleId: 's1', patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB', category: 'CHILDHOOD', status: 'SCHEDULED', dueDate: new Date(), scheduledDate: new Date(), doseNumber: 1, totalDoses: 1, metadata: makeBaseRecord().metadata };
      await expect(timelineService.publishVaccinationScheduled(schedule as any, 'Dr. S')).resolves.not.toThrow();
      expect(vi.mocked(setDoc)).toHaveBeenCalled();
    });

    it('should publish vaccination administered to timeline', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);
      await expect(timelineService.publishVaccinationAdministered(makeBaseRecord() as any, 'Dr. A')).resolves.not.toThrow();
    });

    it('should publish vaccination verified to timeline', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap({ summaryFields: { title: 'BCG' } }) as never);
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);
      await expect(timelineService.publishVaccinationVerified(VAC_ID, 'Dr. V')).resolves.not.toThrow();
    });

    it('should publish booster due to timeline', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);
      const booster = { boosterId: 'b1', vaccineName: 'Tetanus', dueDate: new Date(), patientName: 'T', status: 'DUE', doseNumber: 1, totalDoses: 1, metadata: makeBaseRecord().metadata } as any;
      await expect(timelineService.publishBoosterDue(booster, PATIENT_ID)).resolves.not.toThrow();
    });

    it('should publish certificate generated to timeline', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);
      const cert = { certificateId: 'c1', vaccineName: 'BCG', patientId: PATIENT_ID, facilityName: 'H', generatedAt: new Date(), ownerId: OWNER_ID, metadata: makeBaseRecord().metadata } as any;
      await expect(timelineService.publishCertificateGenerated(cert, 'Dr. G')).resolves.not.toThrow();
    });

    it('should publish adverse event to timeline', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);
      const ae = { reportedAt: new Date(), symptoms: ['Fever'], facilityName: 'H' } as any;
      await expect(timelineService.publishAdverseEventRecorded(VAC_ID, ae, 'Dr. R')).resolves.not.toThrow();
    });

    it('should record adverse event via event bus', async () => {
      const received: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('AdverseEventRecorded', (p) => { received.push(p); });

      await timelineService.recordAdverseEvent(VAC_ID, { reportedAt: new Date(), symptoms: ['Fever'], severity: 'MILD', reporterName: 'Dr. R', isReportedToAuthority: false } as any, 'Dr. R');
      expect(received).toHaveLength(1);
    });
  });

  // ─── 10. VaccinationCache ────────────────────────────────────────────────
  describe('VaccinationCache', () => {
    it('should set and get pagination cache', () => {
      const data = [makeBaseRecord() as any];
      CACHE.setCachedVaccinations(PATIENT_ID, 1, 20, data);
      const cached = CACHE.getCachedVaccinations(PATIENT_ID, 1, 20);
      expect(cached).toEqual(data);
    });

    it('should return undefined for cache miss', () => {
      expect(CACHE.getCachedVaccinations('unknown', 1, 20)).toBeUndefined();
    });

    it('should set and get statistics cache', () => {
      const stats = { completed: 5, due: 2, overdue: 1, boosters: 3, coveragePercentage: 80, upcomingThisMonth: 4, totalScheduled: 10, totalVaccinations: 8 };
      CACHE.setCachedStatistics(PATIENT_ID, stats);
      expect(CACHE.getCachedStatistics(PATIENT_ID)).toEqual(stats);
    });

    it('should set and get timeline cache', () => {
      const data = [{ entryId: 'e1', vaccinationId: VAC_ID, eventName: 'Administered', eventType: 'administered' as const, description: 'Done', timestamp: new Date(), performedBy: 'Dr. A' }];
      CACHE.setCachedTimeline(PATIENT_ID, data as any);
      expect(CACHE.getCachedTimeline(PATIENT_ID)).toEqual(data);
    });

    it('should set and get certificate cache', () => {
      const data = [{ certificateId: 'c1', vaccinationId: VAC_ID, certificateNumber: 'ARV-001', certificateType: 'IMMUNIZATION_CERTIFICATE' as const, qrCodeData: 'qr', generatedAt: new Date(), generatedBy: 'Dr. G', patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB', doseNumber: 1, totalDoses: 1, administeredAt: new Date(), administeredBy: 'Dr. A', facilityName: 'H', expiryDate: new Date(), isRevoked: false, metadata: makeBaseRecord().metadata }];
      CACHE.setCachedCertificates(PATIENT_ID, data as any);
      expect(CACHE.getCachedCertificates(PATIENT_ID)).toEqual(data);
    });

    it('should invalidate cache by patient', () => {
      CACHE.setCachedVaccinations(PATIENT_ID, 1, 10, [makeBaseRecord() as any]);
      CACHE.invalidateVaccinationCache(PATIENT_ID);
      expect(CACHE.getCachedVaccinations(PATIENT_ID, 1, 10)).toBeUndefined();
    });

    it('should clear all caches', () => {
      CACHE.setCachedVaccinations(PATIENT_ID, 1, 10, [makeBaseRecord() as any]);
      CACHE.invalidateAllVaccinationCaches();
      expect(CACHE.getCachedVaccinations(PATIENT_ID, 1, 10)).toBeUndefined();
    });
  });

  // ─── 11. VaccinationRetry ────────────────────────────────────────────────
  describe('VaccinationRetry', () => {
    it('should succeed on first attempt', async () => {
      const result = await RETRY.vaccinationRetry(async () => 'success');
      expect(result).toBe('success');
    });

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const result = await RETRY.vaccinationRetry(async () => {
        attempts++;
        if (attempts < 3) throw new Error('transient');
        return 'ok';
      });
      expect(result).toBe('ok');
      expect(attempts).toBe(3);
    });

    it('should throw after exhausting retries', async () => {
      await expect(RETRY.vaccinationRetry(async () => { throw new Error('always fails'); }, { maxAttempts: 2 })).rejects.toThrow('always fails');
    });

    it('aggressive retry should have more attempts', async () => {
      let attempts = 0;
      await expect(RETRY.vaccinationRetryAggressive(async () => { attempts++; throw new Error('fail'); }, { maxAttempts: 2 })).rejects.toThrow();
      expect(attempts).toBe(2);
    });

    it('retryVaccinationFetch should return result on success', async () => {
      const result = await RETRY.retryVaccinationFetch(async () => 'data', 5000);
      expect(result).toBe('data');
    });
  });

  // ─── 12. VaccinationObservability ────────────────────────────────────────
  describe('VaccinationObservability', () => {
    it('should start and end a span', () => {
      const span = OBS.startVaccinationSpan('test.op');
      expect(span.operationName).toBe('test.op');
      expect(span.startTime).toBeGreaterThan(0);
      expect(() => span.end('success')).not.toThrow();
    });

    it('should record error', () => {
      expect(() => OBS.recordVaccinationError('test.op', 'ERR_001')).not.toThrow();
    });

    it('should increment metric', () => {
      expect(() => OBS.incrementVaccinationMetric('test.count')).not.toThrow();
    });

    it('trackVaccinationOperation should return result on success', async () => {
      const result = await OBS.trackVaccinationOperation('test.op', async () => 42);
      expect(result).toBe(42);
    });

    it('trackVaccinationOperation should propagate errors', async () => {
      await expect(OBS.trackVaccinationOperation('test.op', async () => { throw new Error('fail'); })).rejects.toThrow('fail');
    });

    it('should export operation names', () => {
      expect(OBS.VaccinationOp.CREATE).toBe('vaccination.create');
      expect(OBS.VaccinationOp.VERIFY).toBe('vaccination.verify');
      expect(OBS.VaccinationOp.GENERATE_CERTIFICATE).toBe('vaccination.generateCertificate');
    });
  });

  // ─── 13. Accessibility Utilities ─────────────────────────────────────────
  describe('Accessibility', () => {
    beforeEach(() => {
      if (typeof document !== 'undefined') {
        document.getElementById = vi.fn();
        document.querySelector = vi.fn();
        document.body = { appendChild: vi.fn() } as any;
      }
    });

    it('should create screen reader announcer element', () => {
      const appendChild = vi.fn();
      const originalBody = (global as any).document?.body;
      Object.defineProperty(global, 'document', {
        value: {
          body: { appendChild },
          getElementById: vi.fn().mockReturnValue(null),
          createElement: vi.fn().mockReturnValue({ setAttribute: vi.fn(), className: '' }),
        },
        writable: true,
        configurable: true,
      });

      ACCESS.announceToScreenReader('Test message');
      expect(appendChild).toHaveBeenCalled();
    });

    it('focusElement should call focus on found element', () => {
      const focus = vi.fn();
      const getElementById = vi.fn().mockReturnValue({ focus });
      Object.defineProperty(global, 'document', {
        value: { getElementById },
        writable: true,
        configurable: true,
      });

      ACCESS.focusElement('test-id');
      expect(focus).toHaveBeenCalled();
    });
  });

  // ─── 14. ScheduleService — Edge Cases ────────────────────────────────────
  describe('ScheduleService Edge Cases', () => {
    const scheduleService = ScheduleService.getInstance();

    it('should calculate booster due date for complete series', async () => {
      const record = makeBaseRecord({ doseNumber: 3, totalDoses: 3, vaccineName: 'Tetanus Toxoid', administeredAt: new Date('2024-01-01') });
      const date = await scheduleService.calculateBoosterDueDate(record as any);
      expect(date).toBeInstanceOf(Date);
      expect(date!.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });

    it('should return null booster due date for incomplete series', async () => {
      const record = makeBaseRecord({ doseNumber: 1, totalDoses: 3 });
      const date = await scheduleService.calculateBoosterDueDate(record as any);
      expect(date).toBeNull();
    });

    it('should calculate missed vaccines', async () => {
      const pastDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [{ data: () => ({ scheduleId: 's1', patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB', category: 'CHILDHOOD', status: 'SCHEDULED', dueDate: pastDate, scheduledDate: new Date(), doseNumber: 1, totalDoses: 1, metadata: makeBaseRecord().metadata }) }] } as any);
      const missed = await scheduleService.calculateMissedVaccines(PATIENT_ID);
      expect(missed.length).toBeGreaterThan(0);
    });

    it('should calculate catch-up schedule', async () => {
      const pastDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const missed = [{ scheduleId: 's1', patientId: PATIENT_ID, patientName: 'T', vaccineName: 'BCG', diseaseTargeted: 'TB', category: 'CHILDHOOD', status: 'SCHEDULED', dueDate: pastDate, scheduledDate: new Date(), doseNumber: 1, totalDoses: 1, metadata: makeBaseRecord().metadata }];
      const catchUp = await scheduleService.calculateCatchUpSchedule(PATIENT_ID, missed as any);
      expect(catchUp).toHaveLength(1);
      expect(catchUp[0].notes).toContain('Catch-up');
    });
  });

  // ─── 15. BoosterService — Edge Cases ─────────────────────────────────────
  describe('BoosterService Edge Cases', () => {
    const boosterService = BoosterService.getInstance();

    it('should handle vaccine name variations for interval calculation', async () => {
      const oldDate = new Date(Date.now() - 11 * 365 * 24 * 60 * 60 * 1000);
      const testCases = [
        { vaccineName: 'Td Booster', doseNumber: 1, totalDoses: 1, administeredAt: oldDate, expectEligible: true },
        { vaccineName: 'COVID-19 Booster', doseNumber: 1, totalDoses: 1, administeredAt: oldDate, expectEligible: true },
        { vaccineName: 'Influenza Vaccine', doseNumber: 1, totalDoses: 1, administeredAt: oldDate, expectEligible: true },
        { vaccineName: 'MMR', doseNumber: 1, totalDoses: 1, administeredAt: oldDate, expectEligible: false },
        { vaccineName: 'BCG', doseNumber: 1, totalDoses: 1, administeredAt: oldDate, expectEligible: false },
      ];

      for (const tc of testCases) {
        const record = makeBaseRecord(tc);
        const result = await boosterService.checkEligibility(record as any);
        expect(result.eligible).toBe(tc.expectEligible);
      }
    });
  });
});
