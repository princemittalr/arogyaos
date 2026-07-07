import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDoc, updateDoc, setDoc, getDocs } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Mocks — must be declared before imports that trigger module resolution
// ---------------------------------------------------------------------------

vi.mock('@/firebase/client', () => ({
  db: { type: 'mock-db' },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db: unknown, name: string) => ({ type: 'collection', name })),
  doc: vi.fn((_db: unknown, path: string, id: string) => ({ type: 'document', path, id })),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn((q: unknown) => q),
  where: vi.fn(),
  orderBy: vi.fn(),
}));

// HealthVaultService mock using the established class pattern
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

// ---------------------------------------------------------------------------
// Deferred imports (after mocks are hoisted)
// ---------------------------------------------------------------------------

import { VaccinationEventBus } from './core/events';
import { VaccinationService } from './services/VaccinationService';
import { CertificateGenerationService } from './services/CertificateGenerationService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_PATIENT_ID = 'pat_test_123';
const MOCK_VACCINATION_ID = 'rec_test_001';

function makeExistsSnap(data: Record<string, unknown>) {
  return { exists: () => true, data: () => data };
}

function makeEmptySnap() {
  return { exists: () => false, data: () => ({}) };
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('Vaccination & Immunization Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    VaccinationEventBus.getInstance().reset();
  });

  // -------------------------------------------------------------------------
  describe('VaccinationEventBus', () => {
    it('should subscribe and publish VaccineScheduled events', async () => {
      const eventBus = VaccinationEventBus.getInstance();
      const received: unknown[] = [];

      eventBus.subscribe('VaccineScheduled', (payload) => {
        received.push(payload);
      });

      const mockSchedule = {
        scheduleId: 'sched_1',
        patientId: MOCK_PATIENT_ID,
        vaccineName: 'BCG',
        diseaseTargeted: 'Tuberculosis',
        category: 'childhood' as const,
        status: 'scheduled' as const,
        dueDate: new Date(),
        doseNumber: 1,
        totalDoses: 1,
      };

      await eventBus.publish('VaccineScheduled', {
        schedule: mockSchedule,
        timestamp: new Date(),
      });

      expect(received).toHaveLength(1);
      const event = received[0] as { schedule: typeof mockSchedule };
      expect(event.schedule.vaccineName).toBe('BCG');
    });

    it('should isolate errors thrown by individual subscribers', async () => {
      const eventBus = VaccinationEventBus.getInstance();
      const succeeded: unknown[] = [];

      eventBus.subscribe('VaccineAdministered', () => {
        throw new Error('Subscriber crashed');
      });
      eventBus.subscribe('VaccineAdministered', (p) => {
        succeeded.push(p);
      });

      const mockVaccination = {
        recordId: 'v1',
        vaccinationId: 'v1',
        patientId: MOCK_PATIENT_ID,
        ownerId: MOCK_PATIENT_ID,
        patientName: 'Test Patient',
        vaccineName: 'MMR',
        diseaseTargeted: 'Measles, Mumps, Rubella',
        category: 'childhood' as const,
        status: 'administered' as const,
        doseNumber: 1,
        totalDoses: 2,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'SYSTEM',
          updatedBy: 'SYSTEM',
          version: 1,
          status: 'ACTIVE' as const,
          source: 'provider' as const,
          ownerId: MOCK_PATIENT_ID,
          origin: {
            deviceId: 'device-01',
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
      };

      await expect(
        eventBus.publish('VaccineAdministered', {
          vaccination: mockVaccination,
          timestamp: new Date(),
        })
      ).resolves.not.toThrow();

      expect(succeeded).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  describe('VaccinationService - scheduleVaccine', () => {
    it('should create a schedule document and publish VaccineScheduled event', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      const events: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('VaccineScheduled', (p) => {
        events.push(p);
      });

      const scheduleId = await VaccinationService.scheduleVaccine({
        patientId: MOCK_PATIENT_ID,
        vaccineName: 'COVID-19 Vaccine',
        diseaseTargeted: 'COVID-19',
        category: 'covid',
        dueDate: new Date(Date.now() + 7 * 86400000),
        doseNumber: 2,
        totalDoses: 2,
      });

      expect(vi.mocked(setDoc)).toHaveBeenCalledOnce();
      expect(scheduleId).toMatch(/^sched_/);
      expect(events).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  describe('VaccinationService - administerVaccine', () => {
    it('should ingest into Health Vault, create a local record, and publish VaccineAdministered', async () => {
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const capturedEvents: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('VaccineAdministered', (p) => {
        capturedEvents.push(p);
      });

      const vaccinationId = await VaccinationService.administerVaccine({
        patientId: MOCK_PATIENT_ID,
        ownerId: MOCK_PATIENT_ID,
        patientName: 'Riya Sharma',
        vaccineName: 'Hepatitis B Vaccine',
        diseaseTargeted: 'Hepatitis B',
        category: 'hepatitis',
        doseNumber: 1,
        totalDoses: 3,
        administeredBy: 'Dr. Rajiv Kumar',
        facilityName: 'Apollo Clinic',
        batchNumber: 'BN-20261',
        manufacturer: 'GlaxoSmithKline',
        administeredAt: new Date(),
      });

      expect(mockIngestRecord).toHaveBeenCalledOnce();
      expect(vi.mocked(setDoc)).toHaveBeenCalledOnce();
      expect(vaccinationId).toBe('rec_test_001');
      expect(capturedEvents).toHaveLength(1);
    });

    it('should publish BoosterDue event when nextDueDate is provided for a multi-dose vaccine', async () => {
      vi.mocked(setDoc).mockResolvedValue(undefined);
      mockIngestRecord.mockResolvedValueOnce('rec_booster_002');

      const boosterEvents: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('BoosterDue', (p) => {
        boosterEvents.push(p);
      });

      await VaccinationService.administerVaccine({
        patientId: MOCK_PATIENT_ID,
        ownerId: MOCK_PATIENT_ID,
        patientName: 'Riya Sharma',
        vaccineName: 'Hepatitis B Vaccine',
        diseaseTargeted: 'Hepatitis B',
        category: 'hepatitis',
        doseNumber: 1,
        totalDoses: 3,
        administeredBy: 'Dr. Rajiv',
        facilityName: 'Apollo',
        nextDueDate: new Date(Date.now() + 30 * 86400000),
        administeredAt: new Date(),
      });

      expect(boosterEvents).toHaveLength(1);
      const event = boosterEvents[0] as { patientId: string };
      expect(event.patientId).toBe(MOCK_PATIENT_ID);
    });
  });

  // -------------------------------------------------------------------------
  describe('VaccinationService - verifyVaccine', () => {
    it('should throw VaccinationNotFoundError when vaccination does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeEmptySnap() as never);

      await expect(
        VaccinationService.verifyVaccine('invalid_id', 'Dr. Verifier')
      ).rejects.toThrow('Vaccination record with ID "invalid_id" was not found.');
    });

    it('should update status to verified and generate a certificate', async () => {
      const mockVac = {
        recordId: MOCK_VACCINATION_ID,
        vaccinationId: MOCK_VACCINATION_ID,
        ownerId: MOCK_PATIENT_ID,
        patientId: MOCK_PATIENT_ID,
        patientName: 'Test Patient',
        vaccineName: 'BCG',
        diseaseTargeted: 'Tuberculosis',
        category: 'childhood' as const,
        status: 'administered' as const,
        doseNumber: 1,
        totalDoses: 1,
        administeredAt: new Date(),
        administeredBy: 'SYSTEM',
        facilityName: 'Test Clinic',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'SYSTEM',
          updatedBy: 'SYSTEM',
          version: 1,
          status: 'ACTIVE' as const,
          source: 'provider' as const,
          ownerId: MOCK_PATIENT_ID,
          origin: {
            deviceId: 'device-01',
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
      };

      vi.mocked(getDoc)
        .mockResolvedValueOnce(makeExistsSnap(mockVac) as never)  // verify: getById
        .mockResolvedValueOnce(makeExistsSnap(mockVac) as never); // cert gen: getById

      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [], empty: true } as never); // certRepo.getByVaccinationId

      vi.mocked(setDoc).mockResolvedValue(undefined);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const certId = await VaccinationService.verifyVaccine(MOCK_VACCINATION_ID, 'Dr. Singh');

      expect(vi.mocked(updateDoc)).toHaveBeenCalled();
      expect(certId).toBe('rec_test_001');
    });
  });

  // -------------------------------------------------------------------------
  describe('VaccinationService - recordAdverseEvent', () => {
    it('should throw VaccinationNotFoundError if record does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeEmptySnap() as never);

      await expect(
        VaccinationService.recordAdverseEvent('bad_id', {
          reportedAt: new Date(),
          symptoms: 'Fever and chills',
          severity: 'mild',
          reporterName: 'Caregiver',
        })
      ).rejects.toThrow('Vaccination record with ID "bad_id" was not found.');
    });

    it('should throw AdverseEventAlreadyReportedError if adverse event already exists', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(
        makeExistsSnap({
          vaccinationId: MOCK_VACCINATION_ID,
          adverseEvent: { severity: 'mild', symptoms: 'Pre-existing AE' },
        }) as never
      );

      await expect(
        VaccinationService.recordAdverseEvent(MOCK_VACCINATION_ID, {
          reportedAt: new Date(),
          symptoms: 'New event',
          severity: 'moderate',
          reporterName: 'Dr. Reporter',
        })
      ).rejects.toThrow(/already been logged/);
    });

    it('should update vaccination with the adverse event and publish event', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(
        makeExistsSnap({ vaccinationId: MOCK_VACCINATION_ID, adverseEvent: undefined }) as never
      );
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      const aeEvents: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('AdverseEventRecorded', (p) => {
        aeEvents.push(p);
      });

      await VaccinationService.recordAdverseEvent(MOCK_VACCINATION_ID, {
        reportedAt: new Date(),
        symptoms: 'Injection site swelling',
        severity: 'mild',
        reporterName: 'Dr. Patel',
      });

      expect(vi.mocked(updateDoc)).toHaveBeenCalledOnce();
      expect(aeEvents).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  describe('CertificateGenerationService', () => {
    it('should throw VaccinationNotFoundError if vaccination is not found', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce(makeEmptySnap() as never);

      await expect(
        CertificateGenerationService.generateCertificate('bad_vac_id', 'Dr. Verifier')
      ).rejects.toThrow('Vaccination record with ID "bad_vac_id" was not found.');
    });

    it('should generate a certificate, link to vault, and publish CertificateGenerated', async () => {
      const certEvents: unknown[] = [];
      VaccinationEventBus.getInstance().subscribe('CertificateGenerated', (p) => {
        certEvents.push(p);
      });

      const mockVac = {
        recordId: MOCK_VACCINATION_ID,
        vaccinationId: MOCK_VACCINATION_ID,
        ownerId: MOCK_PATIENT_ID,
        patientId: MOCK_PATIENT_ID,
        patientName: 'Riya Sharma',
        vaccineName: 'BCG',
        diseaseTargeted: 'Tuberculosis',
        category: 'childhood' as const,
        status: 'administered' as const,
        doseNumber: 1,
        totalDoses: 1,
        administeredAt: new Date(),
        administeredBy: 'SYSTEM',
        facilityName: 'Test Clinic',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'SYSTEM',
          updatedBy: 'SYSTEM',
          version: 1,
          status: 'ACTIVE' as const,
          source: 'provider' as const,
          ownerId: MOCK_PATIENT_ID,
          origin: {
            deviceId: 'device-01',
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
      };

      vi.mocked(getDoc).mockResolvedValueOnce(makeExistsSnap(mockVac) as never);
      vi.mocked(setDoc).mockResolvedValue(undefined);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const certId = await CertificateGenerationService.generateCertificate(
        MOCK_VACCINATION_ID,
        'Dr. Chief'
      );

      expect(mockIngestRecord).toHaveBeenCalledOnce();
      expect(vi.mocked(setDoc)).toHaveBeenCalledOnce();
      expect(vi.mocked(updateDoc)).toHaveBeenCalledOnce();
      expect(certId).toBe('rec_test_001');
      expect(certEvents).toHaveLength(1);
    });
  });
});
