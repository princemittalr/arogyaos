import { db } from '@/firebase/client';
import { runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ulid } from '@/features/health-vault/utils/ulid';
import { TimelineRepository } from '@/features/health-vault/repositories/TimelineRepository';
import { auditLogger } from '@/features/health-vault/services/AuditLogger';
import { AUDIT_ACTIONS } from '@/features/health-vault/core/auditEvents';
import {
  VAULT_STATUS,
  FHIR_CONFIG,
} from '@/features/health-vault/core/constants';
import type { VaultOrigin } from '@/features/health-vault/types';
import type { VaultSource } from '@/features/health-vault/core/constants';
import { AppointmentSchema } from '../utils/validations';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { AppointmentEventBus } from '../core/events';
import type { Appointment, AppointmentParticipant, AppointmentLocation } from '../types';
import type { AppointmentType, AppointmentPriority, AppointmentSource } from '../core/constants';
import {
  AppointmentNotFoundError,
  InvalidAppointmentStateError,
} from '../core/errors';

export interface CreateAppointmentParams {
  patientId: string;
  patientName: string;
  patientContact?: string;
  appointmentType: AppointmentType;
  priority: AppointmentPriority;
  source: AppointmentSource;
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  providerId: string;
  providerName: string;
  facilityId: string;
  facilityName: string;
  department?: string;
  participants: AppointmentParticipant[];
  location: AppointmentLocation;
  reason?: string;
  notes?: string;
  symptoms?: string[];
  referralId?: string;
  referralSource?: string;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    authorizationNumber?: string;
  };
  tags?: string[];
}

export interface AppointmentContext {
  ownerId: string;
  createdBy: string;
  actorRole: string;
  source: VaultSource;
  origin: VaultOrigin;
}

export interface UpdateAppointmentParams {
  patientName?: string;
  patientContact?: string;
  appointmentType?: AppointmentType;
  priority?: AppointmentPriority;
  department?: string;
  location?: AppointmentLocation;
  reason?: string;
  notes?: string;
  symptoms?: string[];
  tags?: string[];
}

const timelineRepository = new TimelineRepository();

export class AppointmentService {
  private static instance: AppointmentService;
  private readonly appointmentRepo = new AppointmentRepository();
  private readonly eventBus = AppointmentEventBus.getInstance();

  private constructor() {}

  public static getInstance(): AppointmentService {
    if (!AppointmentService.instance) {
      AppointmentService.instance = new AppointmentService();
    }
    return AppointmentService.instance;
  }

  public async createAppointment(
    params: CreateAppointmentParams,
    context: AppointmentContext,
  ): Promise<string> {
    const appointmentId = ulid();
    const endTime = this.calculateEndTime(params.startTime, params.durationMinutes);

    const appointment: Appointment = {
      recordId: appointmentId,
      ownerId: context.ownerId,
      appointmentId,
      patientId: params.patientId,
      patientName: params.patientName,
      patientContact: params.patientContact,
      appointmentType: params.appointmentType,
      status: 'SCHEDULED',
      priority: params.priority,
      source: params.source,
      scheduledDate: params.scheduledDate,
      startTime: params.startTime,
      endTime,
      durationMinutes: params.durationMinutes,
      providerId: params.providerId,
      providerName: params.providerName,
      facilityId: params.facilityId,
      facilityName: params.facilityName,
      department: params.department,
      participants: params.participants,
      location: params.location,
      reason: params.reason,
      notes: params.notes,
      symptoms: params.symptoms,
      referralId: params.referralId,
      referralSource: params.referralSource,
      insuranceInfo: params.insuranceInfo,
      tags: params.tags,
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
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'Encounter',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: 'pending',
      },
    };

    const parseResult = AppointmentSchema.safeParse(appointment);
    if (!parseResult.success) {
      throw new Error(
        `Appointment validation failed: ${parseResult.error.message}`,
      );
    }

    await runTransaction(db, async (transaction) => {
      const existing = await this.appointmentRepo.getById(appointmentId, transaction);
      if (existing) {
        throw new Error(`Appointment with ID "${appointmentId}" already exists.`);
      }

      await this.appointmentRepo.create(appointment, transaction);

      const indexEntry = {
        indexId: appointmentId,
        patientId: context.ownerId,
        recordType: 'consultation' as const,
        recordId: appointmentId,
        encounterDate: Timestamp.fromDate(new Date(params.scheduledDate)),
        summaryFields: {
          title: `${params.appointmentType} - ${params.providerName}`,
          providerName: params.providerName,
          hospitalName: params.facilityName,
          status: VAULT_STATUS.ACTIVE,
        },
        metadata: {
          ...appointment.metadata,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      };

      await timelineRepository.createIndexEntry(indexEntry, transaction);
    });

    await auditLogger.success(AUDIT_ACTIONS.RECORD_CREATED, {
      ownerId: context.ownerId,
      actorId: context.createdBy,
      actorRole: context.actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
      version: 1,
    });

    await this.eventBus.publish('AppointmentCreated', {
      appointment,
      createdBy: context.createdBy,
      timestamp: new Date(),
    });

    return appointmentId;
  }

  public async updateAppointment(
    appointmentId: string,
    params: UpdateAppointmentParams,
    context: { updatedBy: string; ownerId: string; actorRole: string },
  ): Promise<void> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    const nextVersion = existing.metadata.version + 1;

    await runTransaction(db, async (transaction) => {
      const current = await this.appointmentRepo.getById(appointmentId, transaction);
      if (!current) {
        throw new AppointmentNotFoundError(appointmentId);
      }

      await this.appointmentRepo.createVersion(
        appointmentId,
        current.metadata.version,
        current,
        transaction,
      );

      const updated: Appointment = {
        ...current,
        ...params,
        metadata: {
          ...current.metadata,
          version: nextVersion,
          updatedBy: context.updatedBy,
          updatedAt: new Date(),
        },
      };

      await this.appointmentRepo.create(updated, transaction);
    });

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId: context.ownerId,
      actorId: context.updatedBy,
      actorRole: context.actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
      version: nextVersion,
    });
  }

  public async confirmAppointment(
    appointmentId: string,
    confirmedBy: string,
    ownerId: string,
    actorRole: string,
  ): Promise<void> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }
    if (existing.status !== 'SCHEDULED') {
      throw new InvalidAppointmentStateError(appointmentId, existing.status, 'SCHEDULED');
    }

    await this.appointmentRepo.update(appointmentId, {
      status: 'CONFIRMED',
    } as Partial<Appointment>);

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId,
      actorId: confirmedBy,
      actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
    });

    await this.eventBus.publish('AppointmentConfirmed', {
      appointmentId,
      patientId: existing.patientId,
      confirmedBy,
      timestamp: new Date(),
    });
  }

  public async checkIn(
    appointmentId: string,
    checkedInBy: string,
    ownerId: string,
    actorRole: string,
  ): Promise<void> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }
    if (existing.status !== 'CONFIRMED' && existing.status !== 'SCHEDULED') {
      throw new InvalidAppointmentStateError(appointmentId, existing.status, 'CONFIRMED or SCHEDULED');
    }
    const now = new Date().toISOString();

    await this.appointmentRepo.update(appointmentId, {
      status: 'CHECKED_IN',
      checkInTime: now,
      checkInBy: checkedInBy,
    } as Partial<Appointment>);

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId,
      actorId: checkedInBy,
      actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
    });

    await this.eventBus.publish('AppointmentCheckedIn', {
      appointmentId,
      patientId: existing.patientId,
      checkInTime: now,
      checkedInBy,
      timestamp: new Date(),
    });
  }

  public async startConsultation(
    appointmentId: string,
    startedBy: string,
    ownerId: string,
    actorRole: string,
  ): Promise<void> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }
    if (existing.status !== 'CHECKED_IN') {
      throw new InvalidAppointmentStateError(appointmentId, existing.status, 'CHECKED_IN');
    }
    const now = new Date().toISOString();

    await this.appointmentRepo.update(appointmentId, {
      status: 'IN_PROGRESS',
      startTimeActual: now,
    } as Partial<Appointment>);

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId,
      actorId: startedBy,
      actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
    });

    await this.eventBus.publish('AppointmentStarted', {
      appointmentId,
      patientId: existing.patientId,
      providerId: existing.providerId,
      startTime: now,
      timestamp: new Date(),
    });
  }

  public async completeAppointment(
    appointmentId: string,
    completedBy: string,
    ownerId: string,
    actorRole: string,
    diagnosis?: string,
    notes?: string,
  ): Promise<void> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }
    if (existing.status !== 'IN_PROGRESS') {
      throw new InvalidAppointmentStateError(appointmentId, existing.status, 'IN_PROGRESS');
    }
    const now = new Date().toISOString();

    await this.appointmentRepo.update(appointmentId, {
      status: 'COMPLETED',
      endTimeActual: now,
      diagnosis: diagnosis ?? existing.diagnosis,
      notes: notes ?? existing.notes,
    } as Partial<Appointment>);

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId,
      actorId: completedBy,
      actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
    });

    await this.eventBus.publish('AppointmentCompleted', {
      appointmentId,
      patientId: existing.patientId,
      providerId: existing.providerId,
      endTime: now,
      timestamp: new Date(),
    });
  }

  public async cancelAppointment(
    appointmentId: string,
    cancelledBy: string,
    ownerId: string,
    actorRole: string,
    reason: string,
  ): Promise<void> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new InvalidAppointmentStateError(appointmentId, existing.status, 'SCHEDULED, CONFIRMED, CHECKED_IN, or IN_PROGRESS');
    }

    await this.appointmentRepo.update(appointmentId, {
      status: 'CANCELLED',
      cancellation: {
        cancelledAt: new Date().toISOString(),
        cancelledBy,
        cancelledByRole: actorRole,
        reason,
        isOnTime: true,
      },
    } as Partial<Appointment>);

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId,
      actorId: cancelledBy,
      actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
    });

    await this.eventBus.publish('AppointmentCancelled', {
      appointmentId,
      patientId: existing.patientId,
      cancelledBy,
      reason,
      timestamp: new Date(),
    });
  }

  public async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newStartTime: string,
    durationMinutes: number,
    rescheduledBy: string,
    ownerId: string,
    actorRole: string,
  ): Promise<void> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new InvalidAppointmentStateError(appointmentId, existing.status, 'SCHEDULED, CONFIRMED, CHECKED_IN, or IN_PROGRESS');
    }

    const currentRescheduleCount = existing.rescheduledFrom?.rescheduleCount ?? 0;
    const newEndTime = this.calculateEndTime(newStartTime, durationMinutes);

    const nextVersion = existing.metadata.version + 1;

    await runTransaction(db, async (transaction) => {
      const current = await this.appointmentRepo.getById(appointmentId, transaction);
      if (!current) {
        throw new AppointmentNotFoundError(appointmentId);
      }

      await this.appointmentRepo.createVersion(appointmentId, current.metadata.version, current, transaction);

      const updated: Appointment = {
        ...current,
        scheduledDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        durationMinutes,
        status: 'RESCHEDULED',
        rescheduledFrom: {
          previousDate: current.scheduledDate,
          previousStartTime: current.startTime,
          rescheduleCount: currentRescheduleCount + 1,
        },
        metadata: {
          ...current.metadata,
          version: nextVersion,
          updatedBy: rescheduledBy,
          updatedAt: new Date(),
        },
      };

      await this.appointmentRepo.create(updated, transaction);
    });

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId,
      actorId: rescheduledBy,
      actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
      version: nextVersion,
    });

    await this.eventBus.publish('AppointmentRescheduled', {
      appointmentId,
      patientId: existing.patientId,
      previousDate: existing.scheduledDate,
      newDate,
      rescheduledBy,
      timestamp: new Date(),
    });
  }

  public async markNoShow(
    appointmentId: string,
    ownerId: string,
    actorRole: string,
  ): Promise<void> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }
    if (existing.status !== 'SCHEDULED' && existing.status !== 'CONFIRMED') {
      throw new InvalidAppointmentStateError(appointmentId, existing.status, 'SCHEDULED or CONFIRMED');
    }

    await this.appointmentRepo.update(appointmentId, {
      status: 'NO_SHOW',
      noShowNotified: false,
    } as Partial<Appointment>);

    await auditLogger.success(AUDIT_ACTIONS.RECORD_UPDATED, {
      ownerId,
      actorId: 'system',
      actorRole,
      recordId: appointmentId,
      recordType: 'appointment',
    });

    await this.eventBus.publish('AppointmentNoShow', {
      appointmentId,
      patientId: existing.patientId,
      scheduledDate: existing.scheduledDate,
      timestamp: new Date(),
    });
  }

  public async getAppointment(appointmentId: string): Promise<Appointment> {
    const record = await this.appointmentRepo.getById(appointmentId);
    if (!record) {
      throw new AppointmentNotFoundError(appointmentId);
    }
    return record;
  }

  public async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepo.getByPatientId(patientId);
  }

  public async getHistory(appointmentId: string): Promise<Appointment[]> {
    const existing = await this.appointmentRepo.getById(appointmentId);
    if (!existing) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    const versions: Appointment[] = [];
    for (let v = 1; v < existing.metadata.version; v++) {
      const versionRecord = await this.appointmentRepo.getVersion(appointmentId, v);
      if (versionRecord) {
        versions.push(versionRecord);
      }
    }
    versions.push(existing);

    return versions;
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }
}
