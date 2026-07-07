import { db } from '@/firebase/client';
import { runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ulid } from '@/features/health-vault/utils/ulid';
import { TimelineRepository } from '@/features/health-vault/repositories/TimelineRepository';
import { auditLogger } from '@/features/health-vault/services/AuditLogger';
import { AUDIT_ACTIONS } from '@/features/health-vault/core/auditEvents';
import {
  VAULT_STATUS,
  VaultSource,
  FHIR_CONFIG,
} from '@/features/health-vault/core/constants';
import { VaultOrigin } from '@/features/health-vault/types';
import { VaccinationRecordSchema } from '../utils/validations';
import { VaccinationRepository } from '../repositories/VaccinationRepository';
import { VaccinationEventBus } from '../core/events';
import {
  VaccinationRecord,
  AdverseEvent,
} from '../types';
import {
  VaccinationNotFoundError,
  DuplicateVaccinationError,
} from '../core/errors';

export interface CreateVaccinationParams {
  patientId: string;
  patientName: string;
  vaccineName: string;
  diseaseTargeted: string;
  category: VaccinationRecord['category'];
  doseNumber: number;
  totalDoses: number;
  administeredAt: Date;
  administeredBy: string;
  facilityId: string;
  facilityName: string;
  batchNumber: string;
  lotNumber: string;
  manufacturer: string;
  expiryDate: Date;
  nextDueDate: Date;
  administrationRoute: VaccinationRecord['administrationRoute'];
  administrationSite: VaccinationRecord['administrationSite'];
  adverseEvent?: AdverseEvent;
  certificateId?: string;
  notes?: string;
}

export interface UpdateVaccinationParams {
  patientName?: string;
  vaccineName?: string;
  diseaseTargeted?: string;
  category?: VaccinationRecord['category'];
  status?: VaccinationRecord['status'];
  doseNumber?: number;
  totalDoses?: number;
  administeredAt?: Date;
  administeredBy?: string;
  facilityId?: string;
  facilityName?: string;
  batchNumber?: string;
  lotNumber?: string;
  manufacturer?: string;
  expiryDate?: Date;
  nextDueDate?: Date;
  administrationRoute?: VaccinationRecord['administrationRoute'];
  administrationSite?: VaccinationRecord['administrationSite'];
  adverseEvent?: AdverseEvent;
  certificateId?: string;
  notes?: string;
}

export interface IngestionContext {
  ownerId: string;
  createdBy: string;
  source: VaultSource;
  encounterDate: Date;
  origin: VaultOrigin;
  summaryFields: {
    title: string;
    providerName: string;
    hospitalName: string;
  };
}

const timelineRepository = new TimelineRepository();

export class VaccinationService {
  private static instance: VaccinationService;
  private readonly vaccinationRepo = new VaccinationRepository();
  private readonly eventBus = VaccinationEventBus.getInstance();

  private constructor() {}

  public static getInstance(): VaccinationService {
    if (!VaccinationService.instance) {
      VaccinationService.instance = new VaccinationService();
    }
    return VaccinationService.instance;
  }

  public async createVaccination(
    params: CreateVaccinationParams,
    context: IngestionContext,
  ): Promise<string> {
    const recordId = ulid();

    const record: VaccinationRecord = {
      recordId,
      ownerId: context.ownerId,
      vaccinationId: recordId,
      patientId: params.patientId,
      patientName: params.patientName,
      vaccineName: params.vaccineName,
      diseaseTargeted: params.diseaseTargeted,
      category: params.category,
      status: 'ADMINISTERED',
      doseNumber: params.doseNumber,
      totalDoses: params.totalDoses,
      administeredAt: params.administeredAt,
      administeredBy: params.administeredBy,
      facilityId: params.facilityId,
      facilityName: params.facilityName,
      batchNumber: params.batchNumber,
      lotNumber: params.lotNumber,
      manufacturer: params.manufacturer,
      expiryDate: params.expiryDate,
      nextDueDate: params.nextDueDate,
      administrationRoute: params.administrationRoute,
      administrationSite: params.administrationSite,
      adverseEvent: params.adverseEvent,
      certificateId: params.certificateId,
      notes: params.notes,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: context.createdBy,
        updatedBy: context.createdBy,
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: context.source,
        ownerId: context.ownerId,
        origin: context.origin,
        verification: {
          isVerified: false,
        },
        interoperability: {
          resourceType: 'Immunization',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: '',
      },
    };

    const parseResult = VaccinationRecordSchema.safeParse(record);
    if (!parseResult.success) {
      throw new Error(
        `Vaccination validation failed: ${parseResult.error.message}`,
      );
    }

    try {
      await runTransaction(db, async (transaction) => {
        const existing = await this.vaccinationRepo.getById(recordId, transaction);
        if (existing) {
          throw new DuplicateVaccinationError(
            params.patientId,
            params.vaccineName,
            params.doseNumber,
          );
        }

        await this.vaccinationRepo.create(record, transaction);

        const indexEntry = {
          indexId: recordId,
          patientId: context.ownerId,
          recordType: 'vaccination' as const,
          recordId,
          encounterDate: Timestamp.fromDate(context.encounterDate),
          summaryFields: {
            title: context.summaryFields.title,
            providerName: context.summaryFields.providerName,
            hospitalName: context.summaryFields.hospitalName,
            status: VAULT_STATUS.ACTIVE,
          },
          metadata: {
            ...record.metadata,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
        };

        await timelineRepository.createIndexEntry(indexEntry, transaction);
      });
    } catch (err: unknown) {
      if (err instanceof DuplicateVaccinationError) throw err;
      throw err;
    }

    await auditLogger.success(AUDIT_ACTIONS.RECORD_CREATED, {
      ownerId: context.ownerId,
      actorId: context.createdBy,
      actorRole: 'citizen',
      recordId,
      recordType: 'vaccination',
      version: 1,
    });

    await this.eventBus.publish('VaccinationAdministered', {
      vaccination: record,
      administeredBy: params.administeredBy,
      timestamp: new Date(),
    });

    return recordId;
  }

  public async updateVaccination(
    vaccinationId: string,
    params: UpdateVaccinationParams,
    context: { updatedBy: string; ownerId: string; actorRole: string },
  ): Promise<void> {
    const existing = await this.vaccinationRepo.getById(vaccinationId);
    if (!existing) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    const nextVersion = existing.metadata.version + 1;

    try {
      await runTransaction(db, async (transaction) => {
        const current = await this.vaccinationRepo.getById(
          vaccinationId,
          transaction,
        );
        if (!current) {
          throw new VaccinationNotFoundError(vaccinationId);
        }

        await this.vaccinationRepo.createVersion(
          vaccinationId,
          current.metadata.version,
          current,
          transaction,
        );

        const updatedRecord: VaccinationRecord = {
          ...current,
          ...params,
          metadata: {
            ...current.metadata,
            version: nextVersion,
            updatedBy: context.updatedBy,
            updatedAt: new Date(),
          },
        };

        await this.vaccinationRepo.create(updatedRecord, transaction);
      });
    } catch (err: unknown) {
      if (err instanceof VaccinationNotFoundError) throw err;
      throw err;
    }

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId: context.ownerId,
      actorId: context.updatedBy,
      actorRole: context.actorRole,
      recordId: vaccinationId,
      recordType: 'vaccination',
      version: nextVersion,
    });
  }

  public async verifyVaccination(
    vaccinationId: string,
    verifiedBy: string,
  ): Promise<void> {
    const existing = await this.vaccinationRepo.getById(vaccinationId);
    if (!existing) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    await this.vaccinationRepo.update(vaccinationId, {
      status: 'VERIFIED',
    });

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId: existing.ownerId,
      actorId: verifiedBy,
      actorRole: 'provider',
      recordId: vaccinationId,
      recordType: 'vaccination',
    });

    await this.eventBus.publish('VaccinationVerified', {
      vaccinationId,
      verifiedBy,
      timestamp: new Date(),
    });
  }

  public async archiveVaccination(
    vaccinationId: string,
    archivedBy: string,
    ownerId: string,
  ): Promise<void> {
    const existing = await this.vaccinationRepo.getById(vaccinationId);
    if (!existing) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    await this.vaccinationRepo.update(vaccinationId, {
      metadata: {
        ...existing.metadata,
        status: VAULT_STATUS.ARCHIVED,
        updatedBy: archivedBy,
        updatedAt: new Date(),
      },
    });

    await auditLogger.success(AUDIT_ACTIONS.RECORD_ARCHIVED, {
      ownerId,
      actorId: archivedBy,
      actorRole: 'citizen',
      recordId: vaccinationId,
      recordType: 'vaccination',
    });

    await this.eventBus.publish('VaccinationArchived', {
      vaccinationId,
      archivedBy,
      timestamp: new Date(),
    });
  }

  public async restoreVaccination(
    vaccinationId: string,
    restoredBy: string,
    ownerId: string,
  ): Promise<void> {
    const existing = await this.vaccinationRepo.getById(vaccinationId);
    if (!existing) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    await this.vaccinationRepo.update(vaccinationId, {
      metadata: {
        ...existing.metadata,
        status: VAULT_STATUS.ACTIVE,
        updatedBy: restoredBy,
        updatedAt: new Date(),
      },
    });

    await auditLogger.success(AUDIT_ACTIONS.RECORD_RESTORED, {
      ownerId,
      actorId: restoredBy,
      actorRole: 'citizen',
      recordId: vaccinationId,
      recordType: 'vaccination',
    });

    await this.eventBus.publish('VaccinationRestored', {
      vaccinationId,
      restoredBy,
      timestamp: new Date(),
    });
  }

  public async getHistory(
    vaccinationId: string,
  ): Promise<VaccinationRecord[]> {
    const existing = await this.vaccinationRepo.getById(vaccinationId);
    if (!existing) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    const versions: VaccinationRecord[] = [];
    for (let v = 1; v < existing.metadata.version; v++) {
      const versionRecord = await this.vaccinationRepo.getVersion(
        vaccinationId,
        v,
      );
      if (versionRecord) {
        versions.push(versionRecord);
      }
    }
    versions.push(existing);

    return versions;
  }

  public async getVaccination(
    vaccinationId: string,
  ): Promise<VaccinationRecord> {
    const record = await this.vaccinationRepo.getById(vaccinationId);
    if (!record) {
      throw new VaccinationNotFoundError(vaccinationId);
    }
    return record;
  }

  public async getVaccinationsByPatient(
    patientId: string,
  ): Promise<VaccinationRecord[]> {
    return this.vaccinationRepo.getByPatientId(patientId);
  }
}
