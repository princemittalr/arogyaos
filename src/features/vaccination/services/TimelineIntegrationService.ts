import { Timestamp } from 'firebase/firestore';
import { TimelineRepository } from '@/features/health-vault/repositories/TimelineRepository';
import { ulid } from '@/features/health-vault/utils/ulid';
import { VAULT_STATUS, FHIR_CONFIG } from '@/features/health-vault/core/constants';
import {
  VaccineSchedule,
  VaccinationRecord,
  VaccineCertificate,
  AdverseEvent,
  BoosterRecord,
} from '../types';
import { VaccinationEventBus } from '../core/events';

const timelineRepository = new TimelineRepository();

export class TimelineIntegrationService {
  private static instance: TimelineIntegrationService;
  private readonly eventBus = VaccinationEventBus.getInstance();

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
    this.eventBus.subscribe('VaccinationScheduled', async (payload) => {
      await this.publishVaccinationScheduled(
        payload.schedule,
        payload.scheduledBy,
      );
    });

    this.eventBus.subscribe('VaccinationAdministered', async (payload) => {
      await this.publishVaccinationAdministered(
        payload.vaccination,
        payload.administeredBy,
      );
    });

    this.eventBus.subscribe('VaccinationVerified', async (payload) => {
      await this.publishVaccinationVerified(
        payload.vaccinationId,
        payload.verifiedBy,
      );
    });

    this.eventBus.subscribe('BoosterDue', async (payload) => {
      await this.publishBoosterDue(
        payload.booster,
        payload.patientId,
      );
    });

    this.eventBus.subscribe('CertificateGenerated', async (payload) => {
      await this.publishCertificateGenerated(
        payload.certificate,
        payload.generatedBy,
      );
    });

    this.eventBus.subscribe('AdverseEventRecorded', async (payload) => {
      await this.publishAdverseEventRecorded(
        payload.vaccinationId,
        payload.adverseEvent,
        payload.recordedBy,
      );
    });
  }

  public async publishVaccinationScheduled(
    schedule: VaccineSchedule,
    scheduledBy: string,
  ): Promise<void> {
    const indexId = ulid();
    const encounterDate =
      schedule.scheduledDate instanceof Date
        ? schedule.scheduledDate
        : new Date();

    await timelineRepository.createIndexEntry({
      indexId,
      patientId: schedule.patientId,
      recordType: 'vaccination',
      recordId: schedule.scheduleId,
      encounterDate: Timestamp.fromDate(encounterDate),
      summaryFields: {
        title: `${schedule.vaccineName} (Dose ${schedule.doseNumber}/${schedule.totalDoses}) - Scheduled`,
        providerName: scheduledBy,
        hospitalName: '',
        status: VAULT_STATUS.ACTIVE,
      },
      metadata: {
        createdAt: encounterDate,
        updatedAt: encounterDate,
        createdBy: scheduledBy,
        updatedBy: scheduledBy,
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: 'citizen',
        ownerId: schedule.patientId,
        origin: {
          deviceId: 'system',
          deviceType: 'system',
          platform: 'ArogyaOS',
          browser: 'system',
          appVersion: '1.0.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'Immunization',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: '',
      },
    });
  }

  public async publishVaccinationAdministered(
    vaccination: VaccinationRecord,
    administeredBy: string,
  ): Promise<void> {
    const indexId = ulid();
    const encounterDate =
      vaccination.administeredAt instanceof Date
        ? vaccination.administeredAt
        : new Date();

    await timelineRepository.createIndexEntry({
      indexId,
      patientId: vaccination.ownerId,
      recordType: 'vaccination',
      recordId: vaccination.vaccinationId,
      encounterDate: Timestamp.fromDate(encounterDate),
      summaryFields: {
        title: `${vaccination.vaccineName} (Dose ${vaccination.doseNumber}/${vaccination.totalDoses})`,
        providerName: administeredBy,
        hospitalName: vaccination.facilityName,
        status: VAULT_STATUS.ACTIVE,
      },
      metadata: {
        createdAt: encounterDate,
        updatedAt: encounterDate,
        createdBy: administeredBy,
        updatedBy: administeredBy,
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: 'provider',
        ownerId: vaccination.ownerId,
        origin: {
          deviceId: 'system',
          deviceType: 'system',
          platform: 'ArogyaOS',
          browser: 'system',
          appVersion: '1.0.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'Immunization',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: '',
      },
    });
  }

  public async publishVaccinationVerified(
    vaccinationId: string,
     
    _verifiedBy: string,
  ): Promise<void> {
    const existing = await timelineRepository.getIndexEntry(vaccinationId);
    if (!existing) return;

    await timelineRepository.updateIndexEntry(vaccinationId, {
      summaryFields: {
        ...existing.summaryFields,
        title: `${existing.summaryFields.title} - Verified`,
        status: VAULT_STATUS.VERIFIED,
      },
    });
  }

  public async publishBoosterDue(
    booster: BoosterRecord,
    patientId: string,
  ): Promise<void> {
    const indexId = ulid();
    const dueDate =
      booster.dueDate instanceof Date ? booster.dueDate : new Date();

    await timelineRepository.createIndexEntry({
      indexId,
      patientId,
      recordType: 'vaccination',
      recordId: booster.boosterId,
      encounterDate: Timestamp.fromDate(dueDate),
      summaryFields: {
        title: `Booster Due: ${booster.vaccineName}`,
        providerName: 'System',
        hospitalName: '',
        status: VAULT_STATUS.ACTIVE,
      },
      metadata: {
        createdAt: dueDate,
        updatedAt: dueDate,
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: 'citizen',
        ownerId: patientId,
        origin: {
          deviceId: 'system',
          deviceType: 'system',
          platform: 'ArogyaOS',
          browser: 'system',
          appVersion: '1.0.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'Immunization',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: '',
      },
    });
  }

  public async publishCertificateGenerated(
    certificate: VaccineCertificate,
    generatedBy: string,
  ): Promise<void> {
    const indexId = ulid();
    const generatedAt =
      certificate.generatedAt instanceof Date
        ? certificate.generatedAt
        : new Date();

    await timelineRepository.createIndexEntry({
      indexId,
      patientId: certificate.patientId,
      recordType: 'medical_certificate',
      recordId: certificate.certificateId,
      encounterDate: Timestamp.fromDate(generatedAt),
      summaryFields: {
        title: `Vaccination Certificate: ${certificate.vaccineName}`,
        providerName: generatedBy,
        hospitalName: certificate.facilityName,
        status: VAULT_STATUS.ACTIVE,
      },
      metadata: {
        createdAt: generatedAt,
        updatedAt: generatedAt,
        createdBy: generatedBy,
        updatedBy: generatedBy,
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: 'provider',
        ownerId: certificate.ownerId,
        origin: {
          deviceId: 'system',
          deviceType: 'system',
          platform: 'ArogyaOS',
          browser: 'system',
          appVersion: '1.0.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'DocumentReference',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: '',
      },
    });
  }

  public async publishAdverseEventRecorded(
    vaccinationId: string,
    adverseEvent: AdverseEvent,
    recordedBy: string,
  ): Promise<void> {
    const indexId = ulid();
    const reportedAt =
      adverseEvent.reportedAt instanceof Date
        ? adverseEvent.reportedAt
        : new Date();

    await timelineRepository.createIndexEntry({
      indexId,
      patientId: '',
      recordType: 'vaccination',
      recordId: vaccinationId,
      encounterDate: Timestamp.fromDate(reportedAt),
      summaryFields: {
        title: `Adverse Event: ${adverseEvent.symptoms.slice(0, 3).join(', ')}`,
        providerName: recordedBy,
        hospitalName: adverseEvent.facilityName ?? '',
        status: VAULT_STATUS.ACTIVE,
      },
      metadata: {
        createdAt: reportedAt,
        updatedAt: reportedAt,
        createdBy: recordedBy,
        updatedBy: recordedBy,
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: 'provider',
        ownerId: '',
        origin: {
          deviceId: 'system',
          deviceType: 'system',
          platform: 'ArogyaOS',
          browser: 'system',
          appVersion: '1.0.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'Immunization',
          fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
          hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
          checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
        },
        checksum: '',
      },
    });
  }

  public async recordAdverseEvent(
    vaccinationId: string,
    adverseEvent: AdverseEvent,
    recordedBy: string,
  ): Promise<void> {
    await this.eventBus.publish('AdverseEventRecorded', {
      vaccinationId,
      adverseEvent,
      recordedBy,
      timestamp: new Date(),
    });
  }
}
