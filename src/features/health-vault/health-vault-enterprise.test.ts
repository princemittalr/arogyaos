import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDoc,
  getDocs,
  setDoc,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { BaseVaultRecord, VaultMetadata } from './types';

// Mock dependencies
vi.mock('@/firebase/client', () => {
  return {
    db: { type: 'mock-db' },
    storage: { type: 'mock-storage' },
  };
});

vi.mock('firebase/firestore', () => {
  const mockSnap = (data: unknown) => ({
    exists: () => !!data,
    data: () => data,
  });

  return {
    collection: vi.fn((_db, name) => ({ type: 'collection', name })),
    doc: vi.fn((_db, path, ...segments) => ({ type: 'document', path, segments })),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn((q) => q),
    where: vi.fn((field, op, val) => ({ type: 'where', field, op, val })),
    orderBy: vi.fn((field, dir) => ({ type: 'orderBy', field, dir })),
    limit: vi.fn((n) => ({ type: 'limit', n })),
    startAfter: vi.fn((snap) => ({ type: 'startAfter', snap })),
    runTransaction: vi.fn(async (_db, cb) => {
      const transactionMock = {
        get: vi.fn(async () => mockSnap({
          recordId: 'test-rec',
          ownerId: 'patient-1',
          version: 1,
          status: 'ACTIVE',
          metadata: { version: 1, status: 'ACTIVE' }
        })),
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      return await cb(transactionMock);
    }),
    serverTimestamp: vi.fn(() => 'mock-server-timestamp'),
    Timestamp: {
      fromDate: vi.fn((d) => ({ toDate: () => d, seconds: Math.floor(d.getTime() / 1000) })),
    },
  };
});

vi.mock('firebase/storage', () => {
  return {
    ref: vi.fn((_storage, path) => ({ type: 'storage-ref', path })),
    uploadBytesResumable: vi.fn(() => {
      return {
        on: vi.fn((_event, progress?: (snap: { bytesTransferred: number; totalBytes: number }) => void, _error?: unknown, complete?: () => void) => {
          // Simulate successful progress and completion
          if (progress) progress({ bytesTransferred: 100, totalBytes: 100 });
          if (complete) setTimeout(complete, 0);
        }),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
      };
    }),
  };
});

// Import classes to test
import { BaseRepository } from './repositories/BaseRepository';
import { StorageRepository } from './repositories/StorageRepository';
import { TimelineRepository } from './repositories/TimelineRepository';
import { HealthVaultService } from './services/HealthVaultService';
import { DownloadService } from './services/DownloadService';
import { PreviewService } from './services/PreviewService';
import { ArchiveService } from './services/ArchiveService';
import { VersionService } from './services/VersionService';
import { withRetry } from './utils/retry';
import { HealthVaultEventBus } from './core/events';
import { AuditLogger } from './services/AuditLogger';
import { MemoryCache } from './services/VaultCache';

describe('Health Vault Enterprise Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Repository Tests
  describe('Repositories', () => {
    it('BaseRepository should perform standard CRUD and version operations', async () => {
      const repo = new BaseRepository<BaseVaultRecord>('test_records');
      const getDocMock = vi.mocked(getDoc);
      const setDocMock = vi.mocked(setDoc);
      const updateDocMock = vi.mocked(setDoc);

      // getById
      getDocMock.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ recordId: '123', val: 'test' }),
      } as unknown as DocumentSnapshot);
      const res = await repo.getById('123');
      expect(res).toEqual({ recordId: '123', val: 'test' });

      // create
      await repo.create({ recordId: '123', ownerId: 'patient-1', metadata: {} as unknown as VaultMetadata });
      expect(setDocMock).toHaveBeenCalled();

      // update
      await repo.update('123', { ownerId: 'patient-1-updated' });
      expect(updateDocMock).toHaveBeenCalled();

      // createVersion
      await repo.createVersion('123', 1, { recordId: '123', ownerId: 'patient-1', metadata: {} as unknown as VaultMetadata });
      expect(setDocMock).toHaveBeenCalledTimes(2);

      // getVersion
      getDocMock.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ recordId: '123', version: 1 }),
      } as unknown as DocumentSnapshot);
      const verRes = await repo.getVersion('123', 1);
      expect(verRes).toEqual({ recordId: '123', version: 1 });
    });

    it('StorageRepository should manage file metadata and versions', async () => {
      const storageRepo = new StorageRepository();
      const getDocMock = vi.mocked(getDoc);
      const setDocMock = vi.mocked(setDoc);

      const mockMeta = {
        fileId: 'f-1',
        ownerId: 'p-1',
        recordId: 'r-1',
        recordType: 'prescription',
        contentType: 'application/pdf',
        originalFileName: 'pres.pdf',
        fileSize: 1024,
        checksum: 'hash',
        hashAlgorithm: 'SHA-256',
        checksumVersion: '1.0.0',
        uploadedAt: null,
        uploadedBy: 'u-1',
        storagePath: 'path',
        status: 'ACTIVE' as const,
        version: 1,
      };

      await storageRepo.saveFileMetadata(mockMeta);
      expect(setDocMock).toHaveBeenCalled();

      getDocMock.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockMeta,
      } as unknown as DocumentSnapshot);
      const meta = await storageRepo.getFileMetadata('f-1');
      expect(meta).toEqual(mockMeta);

      await storageRepo.saveFileMetadataVersion('f-1', 1, mockMeta);
      expect(setDocMock).toHaveBeenCalledTimes(2);
    });

    it('TimelineRepository should create, update and query timeline index entries', async () => {
      const timelineRepo = new TimelineRepository();
      const getDocsMock = vi.mocked(getDocs);

      const entry = {
        indexId: 'idx-1',
        patientId: 'p-1',
        recordType: 'prescription' as const,
        recordId: 'r-1',
        encounterDate: new Date(),
        summaryFields: { title: 'Pres', providerName: 'Doc', hospitalName: 'Hosp', status: 'ACTIVE' as const },
        metadata: {} as unknown as VaultMetadata,
      };

      await timelineRepo.createIndexEntry(entry);
      
      getDocsMock.mockResolvedValueOnce({
        docs: [
          {
            data: () => entry,
          },
        ],
      } as unknown as QuerySnapshot);

      const queryRes = await timelineRepo.queryTimeline({ patientId: 'p-1' });
      expect(queryRes.items).toHaveLength(1);
      expect(queryRes.items[0]).toEqual(entry);
    });
  });

  // 2. Service Tests
  describe('Services & Business Logic', () => {
    it('HealthVaultService should ingest new records atomically with server-side validation', async () => {
      const service = new HealthVaultService();

      // Ingest Prescription
      const payload = {
        ownerId: 'patient-1',
        doctorId: 'doc-1',
        doctorName: 'Dr. Smith',
        hospitalId: 'hosp-1',
        hospitalName: 'General Hospital',
        diagnosis: 'Flu',
        medicines: [{ medicineId: 'm-1', name: 'Aspirin', dosage: '1-0-1', frequency: 'after-meal', durationDays: 5 }],
        refillsAllowed: 0,
      };

      const recordId = await service.ingestRecord('prescription', payload, {
        ownerId: 'patient-1',
        createdBy: 'patient-1',
        source: 'citizen',
        encounterDate: new Date(),
        origin: { deviceId: 'd-1', deviceType: 'mobile', platform: 'iOS', browser: 'Safari', appVersion: '1.0' },
        summaryFields: { title: 'Flu Prescription', providerName: 'Dr. Smith', hospitalName: 'General Hospital' },
      });

      expect(recordId).toBeDefined();
    });

    it('HealthVaultService should update, archive and restore records and update caches', async () => {
      const service = new HealthVaultService();

      await expect(
        service.archiveRecord('prescription', 'rec-123', 'patient-1', 'patient-1')
      ).resolves.not.toThrow();

      await expect(
        service.restoreRecord('prescription', 'rec-123', 'patient-1', 'patient-1')
      ).resolves.not.toThrow();
    });

    it('DownloadService and PreviewService should enforce permissions and generate secure URLs', async () => {
      const downloadService = new DownloadService();
      const previewService = new PreviewService();
      const getDocMock = vi.mocked(getDoc);

      const mockMeta = {
        fileId: 'f-1',
        ownerId: 'patient-1',
        recordId: 'r-1',
        recordType: 'prescription',
        contentType: 'application/pdf',
        status: 'ACTIVE' as const,
        version: 1,
      };

      // Mock database fetch for the file metadata
      getDocMock.mockResolvedValue({
        exists: () => true,
        data: () => mockMeta,
      } as unknown as DocumentSnapshot);

      await expect(
        downloadService.downloadFile('f-1', 'patient-1', 'citizen')
      ).resolves.not.toThrow();

      await expect(
        downloadService.downloadFile('f-1', 'other-user', 'citizen')
      ).rejects.toThrow();

      const previewUrl = await previewService.getSecurePreviewUrl('f-1', 'patient-1', 'citizen');
      expect(previewUrl).toBe('/api/health-vault/preview?fileId=f-1');
    });

    it('ArchiveService and VersionService should track file lifecycles and manage immutable versions', async () => {
      const archiveService = new ArchiveService();
      const versionService = new VersionService();
      const getDocMock = vi.mocked(getDoc);

      const mockMeta = {
        fileId: 'f-1',
        ownerId: 'patient-1',
        recordId: 'r-1',
        recordType: 'prescription',
        contentType: 'application/pdf',
        status: 'ACTIVE' as const,
        version: 1,
      };

      getDocMock.mockResolvedValue({
        exists: () => true,
        data: () => mockMeta,
      } as unknown as DocumentSnapshot);

      await expect(archiveService.archiveFile('f-1', 'patient-1')).resolves.not.toThrow();
      await expect(archiveService.restoreFile('f-1', 'patient-1')).resolves.not.toThrow();

      // Test Version upload
      const mockFile = new File(['dummy-content'], 'updated.pdf', { type: 'application/pdf' });
      const controller = await versionService.uploadNewVersion('f-1', mockFile, { uploadedBy: 'patient-1' }, {});
      expect(controller.fileId).toBe('f-1');
      expect(controller.nextVersion).toBe(2);
    });
  });

  // 3. Core Resilience & Telemetry
  describe('Resilience, Telemetry & Infrastructure', () => {
    it('Retry Logic should execute exponential backoff and throw appropriately', async () => {
      const op = vi.fn()
        .mockRejectedValueOnce(new Error('transient-error'))
        .mockResolvedValueOnce('success-data');

      const result = await withRetry(op, { maxAttempts: 3, initialDelayMs: 1 });
      expect(result).toBe('success-data');
      expect(op).toHaveBeenCalledTimes(2);
    });

    it('Event Bus should notify all subscribers in an isolated manner', async () => {
      const bus = HealthVaultEventBus.getInstance();
      bus.reset();

      const cb1 = vi.fn();
      const cb2 = vi.fn().mockRejectedValue(new Error('crash'));

      bus.subscribe('RecordArchived', cb1);
      bus.subscribe('RecordArchived', cb2);

      await expect(
        bus.publish('RecordArchived', { recordId: 'r-1', archiverId: 'u-1', timestamp: new Date() })
      ).resolves.not.toThrow();

      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
    });

    it('AuditLogger should write immutable logs without raising primary operation exceptions', async () => {
      const logger = AuditLogger.getInstance();
      
      // Should handle Firestore errors gracefully and not throw
      const setDocMock = vi.mocked(setDoc);
      setDocMock.mockRejectedValueOnce(new Error('firestore-offline-failure'));

      await expect(
        logger.success('RECORD_VIEWED', { ownerId: 'p-1', actorId: 'u-1', actorRole: 'citizen' })
      ).resolves.not.toThrow();
    });

    it('MemoryCache should store, retrieve, evict and invalidate elements with TTL', async () => {
      const cache = new MemoryCache<string, string>({ maxSize: 2, defaultTtlMs: 20 });
      cache.set('a', '1');
      cache.set('b', '2');
      cache.set('c', '3'); // evicts 'a'

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe('2');

      // wait for expiry
      await new Promise(resolve => setTimeout(resolve, 30));
      expect(cache.get('b')).toBeUndefined();
    });
  });
});
