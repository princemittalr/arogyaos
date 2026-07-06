import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDocs, setDoc, updateDoc } from 'firebase/firestore';
import type { QuerySnapshot } from 'firebase/firestore';

// Mock Firebase / Firestore Modules
vi.mock('@/firebase/client', () => {
  return {
    db: { type: 'mock-db' },
  };
});

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_db, name) => ({ type: 'collection', name })),
    doc: vi.fn((_db, path, ...segments) => ({ type: 'document', path, segments })),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn((q) => q),
    where: vi.fn((field, op, val) => ({ type: 'where', field, op, val })),
    orderBy: vi.fn((field, dir) => ({ type: 'orderBy', field, dir })),
    Timestamp: {
      now: () => 'mock-timestamp-now',
      fromDate: (d: Date) => d,
    },
  };
});

// Mock HealthVaultService
const { mockGetRecordDetails, mockUpdateRecord } = vi.hoisted(() => {
  return {
    mockGetRecordDetails: vi.fn(),
    mockUpdateRecord: vi.fn(),
  };
});

vi.mock('@/features/health-vault/services/HealthVaultService', () => {
  return {
    HealthVaultService: class {
      getRecordDetails = mockGetRecordDetails;
      updateRecord = mockUpdateRecord;
    },
  };
});

// Import code to test
import { PrescriptionService } from './services/PrescriptionService';
import { PrescriptionEventBus } from './core/events';
import { RefillLimitExceededError, PrescriptionExpiredError } from './core/errors';
import { PrescriptionRecord } from './types';

describe('Prescription Service & Event Bus Unit Tests', () => {
  let rxService: PrescriptionService;
  let eventBus: PrescriptionEventBus;

  beforeEach(() => {
    vi.clearAllMocks();
    rxService = new PrescriptionService();
    eventBus = PrescriptionEventBus.getInstance();
    eventBus.reset();
  });

  // ─── PrescriptionEventBus Tests ──────────────────────────────────────────────
  describe('PrescriptionEventBus', () => {
    it('should successfully publish and subscribe to domain events', async () => {
      const callback = vi.fn();
      eventBus.subscribe('PrescriptionExpired', callback);

      await eventBus.publish('PrescriptionExpired', {
        recordId: 'pres_123',
        timestamp: new Date(),
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          recordId: 'pres_123',
        })
      );
    });

    it('should isolate errors thrown in individual subscribers', async () => {
      const failingCallback = vi.fn().mockImplementation(() => {
        throw new Error('Listener Crashed');
      });
      const succeedingCallback = vi.fn();

      eventBus.subscribe('PrescriptionExpired', failingCallback);
      eventBus.subscribe('PrescriptionExpired', succeedingCallback);

      await expect(
        eventBus.publish('PrescriptionExpired', {
          recordId: 'pres_123',
          timestamp: new Date(),
        })
      ).resolves.not.toThrow();

      expect(succeedingCallback).toHaveBeenCalledTimes(1);
    });
  });

  // ─── PrescriptionService Tests ───────────────────────────────────────────────
  describe('PrescriptionService - requestRefill', () => {
    const validPrescription: PrescriptionRecord = {
      recordId: 'pres_111',
      ownerId: 'patient_111',
      doctorId: 'doc_111',
      doctorName: 'Dr. Smith',
      hospitalId: 'hosp_111',
      hospitalName: 'General Hospital',
      diagnosis: 'Hypertension',
      refillsAllowed: 3,
      refillsRemaining: 2,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day in the future
      status: 'Active',
      medicines: [
        {
          medicineId: 'med_1',
          name: 'Amlodipine',
          formulation: 'tablet',
          strength: '5mg',
          dosage: {
            pattern: '0-0-1',
            quantityPerDose: 1,
            unit: 'pill',
            timing: 'before-meal',
          },
          schedule: {
            startDate: new Date(),
            endDate: new Date(),
            durationDays: 30,
            recurrence: 'daily',
          },
        },
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'doc_111',
        updatedBy: 'doc_111',
        version: 1,
        status: 'ACTIVE',
        source: 'provider',
        ownerId: 'patient_111',
        origin: {
          deviceId: 'dev_123',
          deviceType: 'mobile',
          platform: 'ios',
          browser: 'safari',
          appVersion: '1.0.0',
        },
        verification: {
          isVerified: true,
          verifiedBy: 'doc_111',
          signature: 'sig_123',
        },
        interoperability: {
          resourceType: 'MedicationRequest',
          fhirVersion: 'R4B',
          hashAlgorithm: 'SHA-256',
          checksumVersion: '1.0.0',
        },
        checksum: '1234567890abcdef',
      },
    };

    it('should successfully submit a refill request when prescription is active and eligible', async () => {
      mockGetRecordDetails.mockResolvedValue(validPrescription);
      const setDocMock = vi.mocked(setDoc);

      const tx = await rxService.requestRefill('pres_111', 1, {
        requesterId: 'patient_111',
        notes: 'Need refills for my business trip.',
      });

      expect(tx).toBeDefined();
      expect(tx.status).toBe('requested');
      expect(tx.requestedQuantity).toBe(1);
      expect(setDocMock).toHaveBeenCalled();
    });

    it('should fail with RefillLimitExceededError when refills remaining is 0', async () => {
      const exhaustedPrescription = {
        ...validPrescription,
        refillsRemaining: 0,
      };
      mockGetRecordDetails.mockResolvedValue(exhaustedPrescription);

      await expect(
        rxService.requestRefill('pres_111', 1, { requesterId: 'patient_111' })
      ).rejects.toThrow(RefillLimitExceededError);
    });

    it('should fail with PrescriptionExpiredError when validUntil has passed', async () => {
      const expiredPrescription = {
        ...validPrescription,
        validUntil: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      };
      mockGetRecordDetails.mockResolvedValue(expiredPrescription);

      await expect(
        rxService.requestRefill('pres_111', 1, { requesterId: 'patient_111' })
      ).rejects.toThrow(PrescriptionExpiredError);
    });
  });

  describe('PrescriptionService - dispenseRefill', () => {
    const activePrescription: PrescriptionRecord = {
      recordId: 'pres_222',
      ownerId: 'patient_111',
      doctorId: 'doc_111',
      doctorName: 'Dr. Smith',
      hospitalId: 'hosp_111',
      hospitalName: 'General Hospital',
      diagnosis: 'Hypertension',
      refillsAllowed: 3,
      refillsRemaining: 3,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24),
      status: 'Active',
      medicines: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'doc_111',
        updatedBy: 'doc_111',
        version: 1,
        status: 'ACTIVE',
        source: 'provider',
        ownerId: 'patient_111',
        origin: {
          deviceId: 'dev_123',
          deviceType: 'mobile',
          platform: 'ios',
          browser: 'safari',
          appVersion: '1.0.0',
        },
        verification: {
          isVerified: true,
          verifiedBy: 'doc_111',
          signature: 'sig_123',
        },
        interoperability: {
          resourceType: 'MedicationRequest',
          fhirVersion: 'R4B',
          hashAlgorithm: 'SHA-256',
          checksumVersion: '1.0.0',
        },
        checksum: '1234567890abcdef',
      },
    };

    it('should successfully dispense a refill, decrementing refillsRemaining and updating status', async () => {
      mockGetRecordDetails.mockResolvedValue(activePrescription);
      const getDocsMock = vi.mocked(getDocs);
      const updateDocMock = vi.mocked(updateDoc);

      // Mock subcollection search finding the refill request
      getDocsMock.mockResolvedValue({
        docs: [
          {
            data: () => ({
              refillId: 'refill_1',
              prescriptionId: 'pres_222',
              status: 'requested',
            }),
          },
        ],
      } as unknown as QuerySnapshot);

      await rxService.dispenseRefill('pres_222', 'refill_1', {
        pharmacistId: 'pharm_1',
        pharmacyId: 'p_hosp_city',
        pharmacyName: 'City Gen Pharmacy',
        ownerId: 'patient_111',
      });

      expect(updateDocMock).toHaveBeenCalled();
      expect(mockUpdateRecord).toHaveBeenCalledWith(
        'prescription',
        'pres_222',
        expect.objectContaining({
          refillsRemaining: 2,
        }),
        expect.any(Object)
      );
    });
  });
});
