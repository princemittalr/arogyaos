import { Timestamp } from 'firebase/firestore';
import { TimelineRepository } from '@/features/health-vault/repositories/TimelineRepository';
import { ulid } from '@/features/health-vault/utils/ulid';
import { VAULT_STATUS, FHIR_CONFIG } from '@/features/health-vault/core/constants';
import { AppointmentEventBus } from '../core/events';

const timelineRepository = new TimelineRepository();

export class TimelineIntegrationService {
  private static instance: TimelineIntegrationService;
  private readonly eventBus = AppointmentEventBus.getInstance();

  private constructor() {
    this.subscribeToEvents();
  }

  public static getInstance(): TimelineIntegrationService {
    if (!TimelineIntegrationService.instance) {
      TimelineIntegrationService.instance = new TimelineIntegrationService();
    }
    return TimelineIntegrationService.instance;
  }

  private subscribeToEvents(): void {
    this.eventBus.subscribe('AppointmentCreated', async (payload) => {
      await this.publishAppointmentCreated(payload);
    });

    this.eventBus.subscribe('AppointmentConfirmed', async (payload) => {
      await this.publishAppointmentConfirmed(payload);
    });

    this.eventBus.subscribe('AppointmentCheckedIn', async (payload) => {
      await this.publishAppointmentCheckedIn(payload);
    });

    this.eventBus.subscribe('AppointmentStarted', async (payload) => {
      await this.publishAppointmentStarted(payload);
    });

    this.eventBus.subscribe('AppointmentCompleted', async (payload) => {
      await this.publishAppointmentCompleted(payload);
    });

    this.eventBus.subscribe('AppointmentCancelled', async (payload) => {
      await this.publishAppointmentCancelled(payload);
    });

    this.eventBus.subscribe('AppointmentRescheduled', async (payload) => {
      await this.publishAppointmentRescheduled(payload);
    });

    this.eventBus.subscribe('AppointmentNoShow', async (payload) => {
      await this.publishAppointmentNoShow(payload);
    });
  }

  public async publishAppointmentCreated(
    payload: import('../core/events').AppointmentCreatedPayload,
  ): Promise<void> {
    const indexId = ulid();
    const appointment = payload.appointment;
    const encounterDate = new Date(appointment.scheduledDate);

    await timelineRepository.createIndexEntry({
      indexId,
      patientId: appointment.patientId,
      recordType: 'consultation',
      recordId: appointment.appointmentId,
      encounterDate: Timestamp.fromDate(encounterDate),
      summaryFields: {
        title: `${appointment.appointmentType} - ${appointment.providerName}`,
        providerName: appointment.providerName,
        hospitalName: appointment.facilityName,
        status: VAULT_STATUS.ACTIVE,
      },
      metadata: {
        createdAt: payload.timestamp,
        updatedAt: payload.timestamp,
        createdBy: payload.createdBy,
        updatedBy: payload.createdBy,
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: 'citizen',
        ownerId: appointment.ownerId,
        origin: {
          deviceId: 'system',
          deviceType: 'system',
          platform: 'ArogyaOS',
          browser: 'system',
          appVersion: '1.0.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'Encounter',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: '',
      },
    });
  }

  public async publishAppointmentConfirmed(
    payload: import('../core/events').AppointmentConfirmedPayload,
  ): Promise<void> {
    const existing = await timelineRepository.getIndexEntry(payload.appointmentId);
    if (!existing) return;

    await timelineRepository.updateIndexEntry(payload.appointmentId, {
      summaryFields: {
        ...existing.summaryFields,
        title: `${existing.summaryFields.title} - Confirmed`,
      },
    });
  }

  public async publishAppointmentCheckedIn(
    payload: import('../core/events').AppointmentCheckedInPayload,
  ): Promise<void> {
    const existing = await timelineRepository.getIndexEntry(payload.appointmentId);
    if (!existing) return;

    await timelineRepository.updateIndexEntry(payload.appointmentId, {
      summaryFields: {
        ...existing.summaryFields,
        title: `${existing.summaryFields.title} - Checked In`,
      },
    });
  }

  public async publishAppointmentStarted(
    payload: import('../core/events').AppointmentStartedPayload,
  ): Promise<void> {
    const existing = await timelineRepository.getIndexEntry(payload.appointmentId);
    if (!existing) return;

    await timelineRepository.updateIndexEntry(payload.appointmentId, {
      summaryFields: {
        ...existing.summaryFields,
        title: `${existing.summaryFields.title} - In Progress`,
        providerName: payload.providerId,
      },
    });
  }

  public async publishAppointmentCompleted(
    payload: import('../core/events').AppointmentCompletedPayload,
  ): Promise<void> {
    const existing = await timelineRepository.getIndexEntry(payload.appointmentId);
    if (!existing) return;

    await timelineRepository.updateIndexEntry(payload.appointmentId, {
      summaryFields: {
        ...existing.summaryFields,
        title: `${existing.summaryFields.title} - Completed`,
        status: VAULT_STATUS.ACTIVE,
      },
    });
  }

  public async publishAppointmentCancelled(
    payload: import('../core/events').AppointmentCancelledPayload,
  ): Promise<void> {
    const existing = await timelineRepository.getIndexEntry(payload.appointmentId);
    if (!existing) return;

    await timelineRepository.updateIndexEntry(payload.appointmentId, {
      summaryFields: {
        ...existing.summaryFields,
        title: `${existing.summaryFields.title} - Cancelled`,
        status: VAULT_STATUS.ARCHIVED,
      },
    });
  }

  public async publishAppointmentRescheduled(
    payload: import('../core/events').AppointmentRescheduledPayload,
  ): Promise<void> {
    const indexId = ulid();
    const encounterDate = new Date(payload.newDate);

    await timelineRepository.createIndexEntry({
      indexId,
      patientId: payload.patientId,
      recordType: 'consultation',
      recordId: payload.appointmentId,
      encounterDate: Timestamp.fromDate(encounterDate),
      summaryFields: {
        title: `Rescheduled: ${payload.previousDate} -> ${payload.newDate}`,
        providerName: payload.rescheduledBy,
        hospitalName: '',
        status: VAULT_STATUS.ACTIVE,
      },
      metadata: {
        createdAt: payload.timestamp,
        updatedAt: payload.timestamp,
        createdBy: payload.rescheduledBy,
        updatedBy: payload.rescheduledBy,
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: 'citizen',
        ownerId: payload.patientId,
        origin: {
          deviceId: 'system',
          deviceType: 'system',
          platform: 'ArogyaOS',
          browser: 'system',
          appVersion: '1.0.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'Encounter',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: '',
      },
    });
  }

  public async publishAppointmentNoShow(
    payload: import('../core/events').AppointmentNoShowPayload,
  ): Promise<void> {
    const existing = await timelineRepository.getIndexEntry(payload.appointmentId);
    if (!existing) return;

    await timelineRepository.updateIndexEntry(payload.appointmentId, {
      summaryFields: {
        ...existing.summaryFields,
        title: `${existing.summaryFields.title} - No Show`,
        status: VAULT_STATUS.ARCHIVED,
      },
    });
  }
}
