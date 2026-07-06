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
  };
});

// Mock HealthVaultService
const { mockIngestRecord, mockGetRecordDetails } = vi.hoisted(() => {
  return {
    mockIngestRecord: vi.fn(() => 'mock-rad-report-111'),
    mockGetRecordDetails: vi.fn(() => ({
      recordId: 'mock-rad-report-111',
      ownerId: 'pat_456',
      studyType: 'MR Brain',
      modality: 'MR',
      bodySite: 'Brain/Head',
      findingNotes: 'No acute changes.',
      impression: 'Normal Brain MRI.',
      radiologistId: 'rad_expert_99',
      radiologistName: 'Dr. Sarah Jenkins, MD',
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

import { RadiologyService } from './services/RadiologyService';
import { RadiologyEventBus } from './core/events';
import { StudyNotFoundError } from './core/errors';

describe('Radiology & Medical Imaging Unit Tests', () => {
  let eventBus: RadiologyEventBus;

  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = RadiologyEventBus.getInstance();
    eventBus.reset();
  });

  describe('RadiologyEventBus', () => {
    it('should successfully subscribe and publish events', async () => {
      const payloadReceived: unknown[] = [];
      const unsub = eventBus.subscribe('CriticalFindingAlert', (payload) => {
        payloadReceived.push(payload);
      });

      const mockPayload = {
        studyInstanceUid: '1.2.840.113619.2.1',
        patientId: 'pat_456',
        patientName: 'Jane Doe',
        modality: 'MR',
        findings: 'Severe acute hemorrhage detected.',
        timestamp: new Date(),
      };

      await eventBus.publish('CriticalFindingAlert', mockPayload);

      expect(payloadReceived).toHaveLength(1);
      expect((payloadReceived[0] as { patientId: string }).patientId).toBe('pat_456');

      unsub();
      await eventBus.publish('CriticalFindingAlert', mockPayload);
      expect(payloadReceived).toHaveLength(1); // Should not increase because of unsub
    });
  });

  describe('RadiologyService - scheduleStudy', () => {
    it('should successfully schedule an imaging study', async () => {
      const mockStudy = {
        studyInstanceUid: '1.2.840.113619.2.222',
        patientId: 'pat_456',
        ownerId: 'pat_456',
        patientName: 'Jane Doe',
        hospitalId: 'hosp_city_gen',
        hospitalName: 'City General Hospital',
        modality: 'MR' as const,
        bodySite: 'Brain/Head',
        referredBy: 'Dr. Arjun Mehta',
        metadata: {
          createdAt: new Date(),
          status: 'ACTIVE' as const,
          version: 1,
          createdBy: 'Dr. Arjun Mehta',
          hash: 'mock-hash',
        },
      };

      // Capture event bus emissions
      const scheduledEvents: unknown[] = [];
      eventBus.subscribe('StudyScheduled', (payload) => {
        scheduledEvents.push(payload);
      });

      const studyUid = await RadiologyService.scheduleStudy(mockStudy);

      expect(studyUid).toBe('1.2.840.113619.2.222');
      expect(scheduledEvents).toHaveLength(1);
      expect((scheduledEvents[0] as { study: { status: string } }).study.status).toBe('registered');
    });
  });

  describe('RadiologyService - startScan', () => {
    it('should throw StudyNotFoundError if the study document is missing', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as unknown as never);

      await expect(
        RadiologyService.startScan('missing-study-uid')
      ).rejects.toThrow(StudyNotFoundError);
    });

    it('should successfully update status to in-progress', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ studyInstanceUid: '1.2.840.113619.2.222', status: 'registered' }),
      } as unknown as never);

      await RadiologyService.startScan('1.2.840.113619.2.222');

      expect(updateDoc).toHaveBeenCalled();
      expect(vi.mocked(updateDoc).mock.calls[0][1]).toMatchObject({
        status: 'in-progress',
      });
    });
  });

  describe('RadiologyService - completeScan', () => {
    it('should successfully update study with completed status, series, and instances metrics', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ studyInstanceUid: '1.2.840.113619.2.222', status: 'in-progress' }),
      } as unknown as never);

      const series = [
        {
          seriesInstanceUid: '1.2.840.113619.2.222.1',
          number: 1,
          modality: 'MR',
          numberOfInstances: 2,
          instances: [
            { sopInstanceUid: '1.2.840.113619.2.222.1.1', number: 1, sopClassUid: '1.2' },
            { sopInstanceUid: '1.2.840.113619.2.222.1.2', number: 2, sopClassUid: '1.2' },
          ],
        },
      ];

      await RadiologyService.completeScan('1.2.840.113619.2.222', series, { manufacturer: 'GE' });

      expect(updateDoc).toHaveBeenCalled();
      expect(vi.mocked(updateDoc).mock.calls[0][1]).toMatchObject({
        status: 'completed',
        numberOfSeries: 1,
        numberOfInstances: 2,
      });
    });
  });

  describe('RadiologyService - submitReport', () => {
    it('should ingest report details into Health Vault and link to the study', async () => {
      const mockStudy = {
        studyInstanceUid: '1.2.840.113619.2.222',
        patientId: 'pat_456',
        patientName: 'Jane Doe',
        hospitalId: 'hosp_city_gen',
        hospitalName: 'City General Hospital',
        modality: 'MR' as const,
        bodySite: 'Brain/Head',
        referredBy: 'Dr. Arjun Mehta',
        status: 'completed',
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockStudy,
      } as unknown as never);

      const reportData = {
        studyInstanceUid: '1.2.840.113619.2.222',
        patientId: 'pat_456',
        patientName: 'Jane Doe',
        radiologistId: 'rad_expert_99',
        radiologistName: 'Dr. Sarah Jenkins, MD',
        findings: 'No acute changes.',
        impression: 'Normal Brain MRI.',
        isCritical: true,
        keyImages: [],
      };

      // Listen for critical find alerts
      const criticalEvents: unknown[] = [];
      eventBus.subscribe('CriticalFindingAlert', (payload) => {
        criticalEvents.push(payload);
      });

      const reportId = await RadiologyService.submitReport(reportData);

      expect(reportId).toBe('mock-rad-report-111');
      expect(mockIngestRecord).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
      expect(criticalEvents).toHaveLength(1);
    });
  });
});
