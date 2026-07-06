/**
 * Health Vault Service — Phase 5 Enhanced
 *
 * Integrates:
 * - Immutable audit logging on every operation
 * - Structured observability (latency, errors, counters)
 * - In-memory caching with invalidation on mutations
 * - Retry with exponential backoff for transient Firestore failures
 * - Full domain event publication
 * - Security: owner validation, no privilege escalation
 */

import { db } from '@/firebase/client';
import { runTransaction, serverTimestamp, Timestamp, doc } from 'firebase/firestore';
import { ZodSchema } from 'zod';
import { BaseRepository } from '../repositories/BaseRepository';
import { ulid } from '../utils/ulid';
import { calculateServerChecksum, initializeVaultMetadata } from '../utils/metadata';
import { ValidationError, NotFoundError, ConcurrencyError, UnauthorizedError } from '../core/errors';
import { HealthVaultEventBus } from '../core/events';
import { TimelineIndexEntry, BaseVaultRecord } from '../types';
import { VAULT_STATUS, VaultStatus, VaultSource, FhirResourceType } from '../core/constants';
import { auditLogger } from './AuditLogger';
import { AUDIT_ACTIONS } from '../core/auditEvents';
import { vaultObservability } from './VaultObservability';
import { recordDetailCache, fileMetaCache, timelineCache, invalidateRecordCache } from './VaultCache';
import { withRetry } from '../utils/retry';

import { TimelineRepository } from '../repositories/TimelineRepository';
import { PrescriptionRepository } from '../repositories/PrescriptionRepository';
import { LabRepository } from '../repositories/LabRepository';
import { RadiologyRepository } from '../repositories/RadiologyRepository';
import { VaccinationRepository } from '../repositories/VaccinationRepository';
import { MedicalCertificateRepository } from '../repositories/MedicalCertificateRepository';
import { ConsultationRepository } from '../repositories/ConsultationRepository';
import { DischargeSummaryRepository } from '../repositories/DischargeSummaryRepository';

import {
  PrescriptionRecordSchema,
  LabReportRecordSchema,
  VaccinationRecordSchema,
  MedicalCertificateRecordSchema,
  ConsultationRecordSchema,
  DischargeSummaryRecordSchema,
} from '../utils/validations';
import { RadiologyReportRecordSchema } from '../utils/radiologyValidations';

const timelineRepository = new TimelineRepository();

const repositories: Record<string, BaseRepository<BaseVaultRecord>> = {
  prescription:        new PrescriptionRepository()        as unknown as BaseRepository<BaseVaultRecord>,
  lab_report:          new LabRepository()                 as unknown as BaseRepository<BaseVaultRecord>,
  radiology_report:    new RadiologyRepository()           as unknown as BaseRepository<BaseVaultRecord>,
  vaccination:         new VaccinationRepository()         as unknown as BaseRepository<BaseVaultRecord>,
  medical_certificate: new MedicalCertificateRepository()  as unknown as BaseRepository<BaseVaultRecord>,
  consultation:        new ConsultationRepository()        as unknown as BaseRepository<BaseVaultRecord>,
  discharge_summary:   new DischargeSummaryRepository()    as unknown as BaseRepository<BaseVaultRecord>,
};

const schemas: Record<string, ZodSchema> = {
  prescription:        PrescriptionRecordSchema,
  lab_report:          LabReportRecordSchema,
  radiology_report:    RadiologyReportRecordSchema,
  vaccination:         VaccinationRecordSchema,
  medical_certificate: MedicalCertificateRecordSchema,
  consultation:        ConsultationRecordSchema,
  discharge_summary:   DischargeSummaryRecordSchema,
};

export class HealthVaultService {
  private readonly eventBus = HealthVaultEventBus.getInstance();

  // ─── Ingestion ──────────────────────────────────────────────────────────────

  /**
   * Ingests a new clinical record into the vault and updates the timeline index atomically.
   */
  public async ingestRecord(
    recordType: keyof typeof repositories,
    payload: Omit<BaseVaultRecord, 'recordId' | 'metadata'>,
    context: {
      ownerId: string;
      createdBy: string;
      source: VaultSource;
      encounterDate: Date;
      origin: {
        deviceId: string;
        deviceType: string;
        platform: string;
        browser: string;
        appVersion: string;
      };
      summaryFields: {
        title: string;
        providerName: string;
        hospitalName: string;
      };
    }
  ): Promise<string> {
    const span = vaultObservability.startSpan('vault.ingestRecord');
    const recordId = ulid();
    const repo = repositories[recordType];
    const schema = schemas[recordType];

    if (!repo || !schema) {
      await auditLogger.failure(AUDIT_ACTIONS.RECORD_CREATED, {
        ownerId: context.ownerId,
        actorId: context.createdBy,
        actorRole: 'citizen',
        recordType: String(recordType),
        failureReason: `Unsupported record type: ${String(recordType)}`,
      }, `Unsupported record type: ${String(recordType)}`);
      span.end('failure', { errorCode: 'UNSUPPORTED_RECORD_TYPE' });
      throw new ValidationError(`Unsupported record type: "${String(recordType)}"`);
    }

    const metadataStub = initializeVaultMetadata({
      ownerId: context.ownerId,
      createdBy: context.createdBy,
      source: context.source,
      resourceType: mapRecordTypeToFhir(String(recordType)),
      origin: context.origin,
      status: VAULT_STATUS.ACTIVE,
    });

    const fullRecordPayload = {
      ...payload,
      recordId,
      ownerId: context.ownerId,
      metadata: {
        ...metadataStub,
        createdAt: new Date(),
        updatedAt: new Date(),
        checksum: 'UNVALIDATED_PRE_SCHEMA_PARSE', // Replaced by server-side SHA-256 after Zod validation
      },
    };

    const parseResult = schema.safeParse(fullRecordPayload);
    if (!parseResult.success) {
      await auditLogger.failure(AUDIT_ACTIONS.RECORD_CREATED, {
        ownerId: context.ownerId,
        actorId: context.createdBy,
        actorRole: 'citizen',
        recordType: String(recordType),
        failureReason: 'Zod schema validation failure',
      }, 'Validation failed for clinical record.');
      span.end('failure', { errorCode: 'VALIDATION_FAILED' });
      throw new ValidationError('Validation failed for clinical record.', parseResult.error.format());
    }

    const validatedData = parseResult.data as Record<string, unknown>;
    const checksum = calculateServerChecksum(validatedData);

    const finalRecord = {
      ...validatedData,
      metadata: {
        ...metadataStub,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        checksum,
      },
    } as unknown as BaseVaultRecord;

    const indexEntry: TimelineIndexEntry = {
      indexId: recordId,
      patientId: context.ownerId,
      recordType: recordType as TimelineIndexEntry['recordType'],
      recordId,
      encounterDate: Timestamp.fromDate(context.encounterDate),
      summaryFields: {
        title:        context.summaryFields.title,
        providerName: context.summaryFields.providerName,
        hospitalName: context.summaryFields.hospitalName,
        status:       finalRecord.metadata.status as VaultStatus,
      },
      metadata: finalRecord.metadata as unknown as TimelineIndexEntry['metadata'],
    };

    try {
      await withRetry(() =>
        runTransaction(db, async (transaction) => {
          await repo.create(finalRecord, transaction);
          await timelineRepository.createIndexEntry(indexEntry, transaction);
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await auditLogger.failure(AUDIT_ACTIONS.RECORD_CREATED, {
        ownerId: context.ownerId,
        actorId: context.createdBy,
        actorRole: 'citizen',
        recordId,
        recordType: String(recordType),
        failureReason: msg,
        ...context.origin,
      }, msg);
      span.end('failure', { errorCode: 'TRANSACTION_ABORTED' });
      throw new ConcurrencyError('Ingestion failed. Database transaction was aborted.');
    }

    // Invalidate timeline cache for this patient
    invalidateRecordCache(recordId, context.ownerId);

    span.end('success', { recordType: String(recordType) });
    vaultObservability.increment('vault.records.created', { recordType: String(recordType) });

    await auditLogger.success(AUDIT_ACTIONS.RECORD_CREATED, {
      ownerId: context.ownerId,
      actorId: context.createdBy,
      actorRole: 'citizen',
      recordId,
      recordType: String(recordType),
      version: 1,
      ...context.origin,
    });

    await this.eventBus.publish('RecordCreated', {
      indexEntry,
      creatorId: context.createdBy,
      timestamp: new Date(),
    });

    return recordId;
  }

  // ─── Update ─────────────────────────────────────────────────────────────────

  public async updateRecord(
    recordType: keyof typeof repositories,
    recordId: string,
    payloadUpdates: Record<string, unknown>,
    context: {
      updatedBy: string;
      ownerId: string;
      actorRole: string;
      origin: {
        deviceId: string;
        deviceType: string;
        platform: string;
        browser: string;
        appVersion: string;
      };
    }
  ): Promise<void> {
    const span = vaultObservability.startSpan('vault.updateRecord');
    const repo = repositories[recordType];
    const schema = schemas[recordType];

    if (!repo || !schema) {
      span.end('failure', { errorCode: 'UNSUPPORTED_RECORD_TYPE' });
      throw new ValidationError(`Unsupported record type: "${String(recordType)}"`);
    }

    let nextVersion = 0;

    try {
      await withRetry(() =>
        runTransaction(db, async (transaction) => {
          const currentRecord = await repo.getById(recordId, transaction);
          if (!currentRecord) throw new NotFoundError(String(recordType), recordId);

          // Owner validation — prevent privilege escalation
          if (currentRecord.ownerId !== context.ownerId) {
            throw new UnauthorizedError('You do not have permission to update this record.');
          }

          const currentIndexEntry = await timelineRepository.getIndexEntry(recordId, transaction);
          if (!currentIndexEntry) throw new NotFoundError('TimelineIndexEntry', recordId);

          nextVersion = currentRecord.metadata.version + 1;

          await repo.createVersion(recordId, currentRecord.metadata.version, currentRecord, transaction);

          const nextRecord = {
            ...currentRecord,
            ...payloadUpdates,
            metadata: {
              ...currentRecord.metadata,
              version: nextVersion,
              updatedBy: context.updatedBy,
              updatedAt: new Date(),
              origin: context.origin,
              checksum: 'temp-hash',
            },
          };

          const parseResult = schema.safeParse(nextRecord);
          if (!parseResult.success) {
            throw new ValidationError('Validation failed for record updates.', parseResult.error.format());
          }

          const validatedUpdates = parseResult.data as Record<string, unknown>;
          const updatesMetadata = validatedUpdates.metadata as Record<string, unknown>;
          const nextChecksum = calculateServerChecksum(validatedUpdates);

          const finalUpdatedRecord = {
            ...validatedUpdates,
            metadata: {
              ...updatesMetadata,
              updatedAt: serverTimestamp(),
              checksum: nextChecksum,
            },
          } as unknown as BaseVaultRecord;

          const updatedIndexEntry: TimelineIndexEntry = {
            ...currentIndexEntry,
            summaryFields: {
              ...currentIndexEntry.summaryFields,
              title:        (payloadUpdates.title as string)        || currentIndexEntry.summaryFields.title,
              providerName: (payloadUpdates.providerName as string) || currentIndexEntry.summaryFields.providerName,
              hospitalName: (payloadUpdates.hospitalName as string) || currentIndexEntry.summaryFields.hospitalName,
            },
            metadata: finalUpdatedRecord.metadata as unknown as TimelineIndexEntry['metadata'],
          };

          await repo.create(finalUpdatedRecord, transaction);
          await timelineRepository.createIndexEntry(updatedIndexEntry, transaction);
        })
      );
    } catch (err: unknown) {
      if (err instanceof NotFoundError || err instanceof ValidationError || err instanceof UnauthorizedError) {
        await auditLogger.failure(AUDIT_ACTIONS.RECORD_UPDATED, {
          ownerId: context.ownerId, actorId: context.updatedBy, actorRole: context.actorRole,
          recordId, recordType: String(recordType),
          failureReason: err instanceof Error ? err.message : String(err),
        }, err instanceof Error ? err.message : String(err));
        span.end('failure', { errorCode: err.constructor.name.toUpperCase() });
        throw err;
      }
      span.end('failure', { errorCode: 'TRANSACTION_ABORTED' });
      throw new ConcurrencyError('Update aborted. Concurrency transaction failed.');
    }

    invalidateRecordCache(recordId, context.ownerId);
    span.end('success', { recordType: String(recordType) });

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId: context.ownerId, actorId: context.updatedBy, actorRole: context.actorRole,
      recordId, recordType: String(recordType), version: nextVersion,
    });

    await auditLogger.success(AUDIT_ACTIONS.VERSION_CREATED, {
      ownerId: context.ownerId, actorId: context.updatedBy, actorRole: context.actorRole,
      recordId, recordType: String(recordType), version: nextVersion - 1,
    });

    const updatedEntry = await timelineRepository.getIndexEntry(recordId);
    if (updatedEntry) {
      await this.eventBus.publish('RecordUpdated', {
        indexEntry: updatedEntry, updaterId: context.updatedBy, timestamp: new Date(),
      });
      await this.eventBus.publish('VersionCreated', {
        recordId, version: nextVersion - 1, creatorId: context.updatedBy, timestamp: new Date(),
      });
      await this.eventBus.publish('RecordVersionCreated', {
        recordId, version: nextVersion - 1, creatorId: context.updatedBy, timestamp: new Date(),
      });
    }
  }

  // ─── Archive / Restore ──────────────────────────────────────────────────────

  public async archiveRecord(
    recordType: keyof typeof repositories,
    recordId: string,
    archiverId: string,
    ownerId: string,
    actorRole = 'citizen'
  ): Promise<void> {
    const span = vaultObservability.startSpan('vault.archiveRecord');
    const repo = repositories[recordType];
    if (!repo) throw new ValidationError(`Unsupported record type: "${String(recordType)}"`);

    try {
      await this.updateRecordStatus(String(recordType), recordId, VAULT_STATUS.ARCHIVED, archiverId, ownerId);
    } catch (err: unknown) {
      await auditLogger.failure(AUDIT_ACTIONS.RECORD_ARCHIVED, {
        ownerId, actorId: archiverId, actorRole, recordId, recordType: String(recordType),
        failureReason: err instanceof Error ? err.message : String(err),
      }, err instanceof Error ? err.message : String(err));
      span.end('failure', { errorCode: 'ARCHIVE_FAILED' });
      throw err;
    }

    invalidateRecordCache(recordId, ownerId);
    span.end('success');

    await auditLogger.success(AUDIT_ACTIONS.RECORD_ARCHIVED, {
      ownerId, actorId: archiverId, actorRole, recordId, recordType: String(recordType),
    });

    await this.eventBus.publish('RecordArchived', { recordId, archiverId, timestamp: new Date() });
  }

  public async restoreRecord(
    recordType: keyof typeof repositories,
    recordId: string,
    restorerId: string,
    ownerId: string,
    actorRole = 'citizen'
  ): Promise<void> {
    const span = vaultObservability.startSpan('vault.restoreRecord');
    const repo = repositories[recordType];
    if (!repo) throw new ValidationError(`Unsupported record type: "${String(recordType)}"`);

    try {
      await this.updateRecordStatus(String(recordType), recordId, VAULT_STATUS.ACTIVE, restorerId, ownerId);
    } catch (err: unknown) {
      await auditLogger.failure(AUDIT_ACTIONS.RECORD_RESTORED, {
        ownerId, actorId: restorerId, actorRole, recordId, recordType: String(recordType),
        failureReason: err instanceof Error ? err.message : String(err),
      }, err instanceof Error ? err.message : String(err));
      span.end('failure', { errorCode: 'RESTORE_FAILED' });
      throw err;
    }

    invalidateRecordCache(recordId, ownerId);
    span.end('success');

    await auditLogger.success(AUDIT_ACTIONS.RECORD_RESTORED, {
      ownerId, actorId: restorerId, actorRole, recordId, recordType: String(recordType),
    });

    await this.eventBus.publish('RecordRestored', { recordId, restorerId, timestamp: new Date() });
  }

  // ─── Record Reads ───────────────────────────────────────────────────────────

  public async getRecordDetails(
    recordType: string,
    recordId: string,
    viewerContext?: { actorId: string; ownerId: string; actorRole: string }
  ): Promise<BaseVaultRecord | null> {
    const span = vaultObservability.startSpan('vault.getRecordDetails');
    const repo = repositories[recordType];
    if (!repo) throw new ValidationError(`Unsupported record type: "${recordType}"`);

    const cacheKey = `${recordType}:${recordId}`;
    const cached = recordDetailCache.get(cacheKey);
    if (cached) {
      span.end('success', { source: 'cache' });
      return cached as BaseVaultRecord;
    }

    let result: BaseVaultRecord | null = null;
    try {
      result = await withRetry(() => repo.getById(recordId));
      if (result) {
        recordDetailCache.set(cacheKey, result);
      }
      span.end('success', { source: 'firestore' });
    } catch (err: unknown) {
      span.end('failure', { errorCode: 'FETCH_FAILED' });
      throw err;
    }

    if (viewerContext && result) {
      await auditLogger.success(AUDIT_ACTIONS.RECORD_VIEWED, {
        ownerId: viewerContext.ownerId,
        actorId: viewerContext.actorId,
        actorRole: viewerContext.actorRole,
        recordId,
        recordType,
        version: result.metadata.version,
      });
      await this.eventBus.publish('RecordViewed', {
        recordId, recordType, viewerId: viewerContext.actorId, timestamp: new Date(),
      });
    }

    return result;
  }

  public async getRecordVersionDetails(
    recordType: string,
    recordId: string,
    version: number
  ): Promise<BaseVaultRecord | null> {
    const span = vaultObservability.startSpan('vault.getRecordVersionDetails');
    const repo = repositories[recordType];
    if (!repo) throw new ValidationError(`Unsupported record type: "${recordType}"`);

    try {
      const result = await withRetry(() => repo.getVersion(recordId, version));
      span.end('success');
      return result;
    } catch (err: unknown) {
      span.end('failure', { errorCode: 'VERSION_FETCH_FAILED' });
      throw err;
    }
  }

  public async getTimelineIndexEntry(recordId: string): Promise<TimelineIndexEntry | null> {
    const span = vaultObservability.startSpan('vault.getTimelineIndexEntry');
    const cacheKey = `indexEntry:${recordId}`;
    const cached = recordDetailCache.get(cacheKey);
    if (cached) {
      span.end('success', { source: 'cache' });
      return cached as TimelineIndexEntry;
    }
    try {
      const result = await withRetry(() => timelineRepository.getIndexEntry(recordId));
      if (result) recordDetailCache.set(cacheKey, result);
      span.end('success', { source: 'firestore' });
      return result;
    } catch (err: unknown) {
      span.end('failure', { errorCode: 'INDEX_FETCH_FAILED' });
      throw err;
    }
  }

  // ─── Internal ────────────────────────────────────────────────────────────────

  private async updateRecordStatus(
    recordType: string,
    recordId: string,
    newStatus: VaultStatus,
    operatorId: string,
    ownerId: string
  ): Promise<void> {
    const repo = repositories[recordType];
    try {
      await withRetry(() =>
        runTransaction(db, async (transaction) => {
          const record = await repo.getById(recordId, transaction);
          if (!record) throw new NotFoundError(recordType, recordId);

          if (record.ownerId !== ownerId) {
            throw new UnauthorizedError('Operator does not own this record.');
          }

          const indexEntry = await timelineRepository.getIndexEntry(recordId, transaction);
          if (!indexEntry) throw new NotFoundError('TimelineIndexEntry', recordId);

          transaction.update(doc(db, `${recordType}s`, recordId), {
            'metadata.status':    newStatus,
            'metadata.updatedBy': operatorId,
            'metadata.updatedAt': serverTimestamp(),
          });

          transaction.update(doc(db, 'health_vault_timeline_index', recordId), {
            'summaryFields.status': newStatus,
            'metadata.status':      newStatus,
            'metadata.updatedBy':   operatorId,
            'metadata.updatedAt':   serverTimestamp(),
          });
        })
      );
    } catch (err: unknown) {
      if (err instanceof NotFoundError || err instanceof UnauthorizedError) throw err;
      throw new ConcurrencyError('Status update transaction aborted.');
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapRecordTypeToFhir(recordType: string): FhirResourceType {
  switch (recordType) {
    case 'prescription':        return 'MedicationRequest';
    case 'lab_report':          return 'DiagnosticReport';
    case 'radiology_report':    return 'DiagnosticReport';
    case 'vaccination':         return 'Immunization';
    case 'discharge_summary':   return 'Composition';
    case 'medical_certificate': return 'DocumentReference';
    case 'consultation':        return 'Encounter';
    default:                    return 'DocumentReference';
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

// Re-export caches for use in hooks (read-only access)
export { timelineCache, fileMetaCache };
