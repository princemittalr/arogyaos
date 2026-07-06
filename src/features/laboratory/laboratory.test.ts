import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDoc, updateDoc } from 'firebase/firestore';

// Mock Firebase / Firestore Modules
vi.mock('@/firebase/client', () => {
  return {
    db: { type: 'mock-db' },
  };
});

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_db, name) => ({ type: 'collection', name })),
    doc: vi.fn((_db, path, id) => ({ type: 'document', path, id })),
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
const { mockIngestRecord, mockGetRecordDetails } = vi.hoisted(() => {
  return {
    mockIngestRecord: vi.fn(() => 'mock-report-id-789'),
    mockGetRecordDetails: vi.fn(() => ({
      recordId: 'mock-report-id-789',
      ownerId: 'p-1',
      testName: 'Complete Blood Count (CBC)',
      laboratoryId: 'hosp-1',
      laboratoryName: 'Care Diagnostic Center',
      technicianId: 'tech-1',
      technicianName: 'Technician Name',
      observations: [
        { parameter: 'Hemoglobin', value: '12.0', unit: 'g/dL', referenceRange: '13.5 - 17.5', isAbnormal: true, status: 'final' }
      ]
    })),
  };
});

vi.mock('@/features/health-vault/services/HealthVaultService', () => {
  return {
    HealthVaultService: class {
      ingestRecord = mockIngestRecord;
      getRecordDetails = mockGetRecordDetails;
    },
  };
});

import { LabService } from './services/lab.service';
import { LaboratoryEventBus } from './core/events';
import { OrderNotFoundError, InvalidSpecimenError } from './core/errors';

describe('Laboratory Module Unit Tests', () => {
  let eventBus: LaboratoryEventBus;

  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = LaboratoryEventBus.getInstance();
    eventBus.reset();
  });

  describe('LaboratoryEventBus', () => {
    it('should successfully subscribe and publish events', async () => {
      const payloadReceived: unknown[] = [];
      const unsub = eventBus.subscribe('SampleCollected', (payload) => {
        payloadReceived.push(payload);
      });

      const mockPayload = {
        request: {
          requestId: 'req-1',
          patientId: 'p-1',
          patientName: 'Test Patient',
          testName: 'CBC',
          orderedBy: 'Dr. Arjun Mehta',
          hospitalId: 'hosp-1',
          hospitalName: 'Care Center',
          status: 'ordered' as const,
          orderedAt: new Date(),
        },
        collectorId: 'tech-1',
        timestamp: new Date(),
      };

      await eventBus.publish('SampleCollected', mockPayload);

      expect(payloadReceived).toHaveLength(1);
      expect((payloadReceived[0] as { collectorId: string }).collectorId).toBe('tech-1');

      unsub();
      await eventBus.publish('SampleCollected', mockPayload);
      expect(payloadReceived).toHaveLength(1); // Unsubscribed, should not increase
    });
  });

  describe('LabService - collectSpecimen', () => {
    it('should throw InvalidSpecimenError if specimenType is empty', async () => {
      await expect(
        LabService.collectSpecimen('req-1', '')
      ).rejects.toThrow(InvalidSpecimenError);
    });

    it('should throw OrderNotFoundError if request does not exist in Firestore', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as unknown as never);

      await expect(
        LabService.collectSpecimen('invalid-req-123', 'Blood')
      ).rejects.toThrow(OrderNotFoundError);
    });

    it('should successfully log specimen collection and update status', async () => {
      const mockRequest = {
        requestId: 'req-123',
        patientId: 'p-1',
        patientName: 'Anjali Sharma',
        testName: 'Complete Blood Count (CBC)',
        orderedBy: 'Dr. Arjun Mehta',
        hospitalId: 'hosp-1',
        hospitalName: 'Care Center',
        status: 'ordered',
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockRequest,
      } as unknown as never);

      await LabService.collectSpecimen('req-123', 'Serum');

      expect(updateDoc).toHaveBeenCalled();
      expect(vi.mocked(updateDoc).mock.calls[0][1]).toMatchObject({
        status: 'sample_collected',
        specimenType: 'Serum',
      });
    });
  });

  describe('LabService - submitLabReport', () => {
    it('should compile observations and ingest into HealthVaultService', async () => {
      const mockRequest = {
        requestId: 'req-123',
        patientId: 'p-1',
        patientName: 'Anjali Sharma',
        testName: 'Complete Blood Count (CBC)',
        orderedBy: 'Dr. Arjun Mehta',
        hospitalId: 'hosp-1',
        hospitalName: 'Care Center',
        status: 'sample_collected',
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockRequest,
      } as unknown as never);

      const observations = [
        { parameter: 'Hemoglobin', value: '12.0', unit: 'g/dL', referenceRange: '13.5 - 17.5', isAbnormal: true }
      ];

      // Capture critical alert events
      const alertEvents: unknown[] = [];
      eventBus.subscribe('CriticalResultAlert', (payload) => {
        alertEvents.push(payload);
      });

      const recordId = await LabService.submitLabReport(
        'req-123',
        'tech-1',
        'Lead Pathologist',
        observations
      );

      expect(recordId).toBe('mock-report-id-789');
      expect(mockIngestRecord).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
      expect(alertEvents).toHaveLength(1);
      expect((alertEvents[0] as { parameterName: string }).parameterName).toBe('Hemoglobin');
    });
  });
});
