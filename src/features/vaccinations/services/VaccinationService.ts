import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { VaccinationRepository } from '../repositories/VaccinationRepository';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { Vaccination, VaccinationSchedule, AdverseEvent } from '../types';
import { VaccinationNotFoundError, AdverseEventAlreadyReportedError } from '../core/errors';
import { VaccinationEventBus } from '../core/events';
import { CertificateGenerationService } from './CertificateGenerationService';

export class VaccinationService {
  private static vaccinationRepo = new VaccinationRepository();
  private static scheduleRepo = new ScheduleRepository();
  private static vaultService = new HealthVaultService();
  private static eventBus = VaccinationEventBus.getInstance();

  /**
   * Schedules a vaccination dose for a patient.
   */
  public static async scheduleVaccine(
    scheduleData: Omit<VaccinationSchedule, 'scheduleId' | 'status'>
  ): Promise<string> {
    const scheduleId = `sched_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const schedule: VaccinationSchedule = {
      ...scheduleData,
      scheduleId,
      status: 'scheduled',
    };

    await this.scheduleRepo.create(schedule);

    // Publish event
    await this.eventBus.publish('VaccineScheduled', {
      schedule,
      timestamp: new Date(),
    });

    return scheduleId;
  }

  /**
   * Records the administration of a vaccine dose.
   */
  public static async administerVaccine(
    vaccinationData: Omit<Vaccination, 'vaccinationId' | 'status' | 'recordId' | 'metadata'>,
    scheduleId?: string
  ): Promise<string> {
    const administeredAt = vaccinationData.administeredAt || new Date();
    
    // 1. Ingest as vaccination record into Health Vault
    const vaultPayload = {
      ownerId: vaccinationData.patientId,
      vaccineName: vaccinationData.vaccineName,
      doseNumber: vaccinationData.doseNumber,
      totalDoses: vaccinationData.totalDoses,
      batchNumber: vaccinationData.batchNumber || 'N/A',
      manufacturer: vaccinationData.manufacturer || 'N/A',
      administeredBy: vaccinationData.administeredBy || 'SYSTEM',
      facilityName: vaccinationData.facilityName || 'Immunization Clinic',
      nextDueDate: vaccinationData.nextDueDate || null,
    };

    const recordId = await this.vaultService.ingestRecord('vaccination', vaultPayload, {
      ownerId: vaccinationData.patientId,
      createdBy: vaccinationData.administeredBy || 'SYSTEM',
      source: 'laboratory', // clinical diagnostic source
      encounterDate: new Date(administeredAt),
      origin: {
        deviceId: 'device-01',
        deviceType: 'Desktop',
        platform: 'ArogyaOS Enterprise',
        browser: 'Secure-Agent',
        appVersion: '1.4.0',
      },
      summaryFields: {
        title: `${vaccinationData.vaccineName} (Dose ${vaccinationData.doseNumber}/${vaccinationData.totalDoses})`,
        providerName: vaccinationData.administeredBy || 'SYSTEM',
        hospitalName: vaccinationData.facilityName || 'Immunization Clinic',
      },
    });

    // 2. Create rich vaccination entity in local repository
    const vaccination: Vaccination = {
      ...vaccinationData,
      recordId,
      vaccinationId: recordId,
      status: 'administered',
      administeredAt,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: vaccinationData.administeredBy || 'SYSTEM',
        updatedBy: vaccinationData.administeredBy || 'SYSTEM',
        version: 1,
        status: 'ACTIVE' as const,
        source: 'laboratory',
        ownerId: vaccinationData.patientId,
        origin: {
          deviceId: 'device-01',
          deviceType: 'Desktop',
          platform: 'ArogyaOS Enterprise',
          browser: 'Secure-Agent',
          appVersion: '1.4.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'Immunization' as const,
          fhirVersion: 'R4B',
          hashAlgorithm: 'SHA-256',
          checksumVersion: '1.0.0',
        },
        checksum: `vaccine-hash-${recordId}`,
      },
    };

    await this.vaccinationRepo.create(vaccination);

    // 3. Mark schedule as administered (or clean up)
    if (scheduleId) {
      try {
        const schedule = await this.scheduleRepo.getById(scheduleId);
        if (schedule) {
          await this.scheduleRepo.update(scheduleId, { status: 'administered' });
        }
      } catch (err) {
        console.error('[VaccinationService] Failed to update schedule:', err);
      }
    }

    // 4. Publish Event
    await this.eventBus.publish('VaccineAdministered', {
      vaccination,
      timestamp: new Date(),
    });

    // 5. If it is a multi-dose vaccine and not complete, notify booster or next dose due
    if (vaccination.doseNumber < vaccination.totalDoses && vaccinationData.nextDueDate) {
      await this.eventBus.publish('BoosterDue', {
        patientId: vaccination.patientId,
        vaccineName: vaccination.vaccineName,
        dueDate: new Date(vaccinationData.nextDueDate),
        timestamp: new Date(),
      });
    }

    return recordId;
  }

  /**
   * Verifies an administered vaccine dose and issues a certificate.
   */
  public static async verifyVaccine(
    vaccinationId: string,
    verifierName: string
  ): Promise<string> {
    const vaccination = await this.vaccinationRepo.getById(vaccinationId);
    if (!vaccination) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    // Update status to verified
    await this.vaccinationRepo.update(vaccinationId, {
      status: 'verified',
    });

    // Publish event
    await this.eventBus.publish('VaccineVerified', {
      vaccinationId,
      verifiedBy: verifierName,
      timestamp: new Date(),
    });

    // Generate certificate
    return await CertificateGenerationService.generateCertificate(vaccinationId, verifierName);
  }

  /**
   * Records an adverse event for a vaccination.
   */
  public static async recordAdverseEvent(
    vaccinationId: string,
    adverseEvent: AdverseEvent
  ): Promise<void> {
    const vaccination = await this.vaccinationRepo.getById(vaccinationId);
    if (!vaccination) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    if (vaccination.adverseEvent) {
      throw new AdverseEventAlreadyReportedError(vaccinationId);
    }

    await this.vaccinationRepo.update(vaccinationId, {
      adverseEvent,
    });

    // Publish event
    await this.eventBus.publish('AdverseEventRecorded', {
      vaccinationId,
      adverseEvent,
      timestamp: new Date(),
    });
  }

  /**
   * Gets all vaccination records for a patient.
   */
  public static async getVaccinationsByPatient(patientId: string): Promise<Vaccination[]> {
    return await this.vaccinationRepo.getByPatientId(patientId);
  }

  /**
   * Gets all vaccination schedules for a patient.
   */
  public static async getSchedulesByPatient(patientId: string): Promise<VaccinationSchedule[]> {
    return await this.scheduleRepo.getByPatientId(patientId);
  }
}
