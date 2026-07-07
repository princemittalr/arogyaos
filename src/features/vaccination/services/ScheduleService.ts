import { ulid } from '@/features/health-vault/utils/ulid';
import { VAULT_STATUS, FHIR_CONFIG } from '@/features/health-vault/core/constants';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { VaccinationEventBus } from '../core/events';
import { VaccineSchedule, Vaccine, VaccinationRecord } from '../types';
import { ScheduleValidationError } from '../core/errors';
import { DEFAULT_CONFIG } from '../core/constants';

export interface ScheduleEngineConfig {
  reminderDaysBeforeDue: number;
  overdueGracePeriodDays: number;
  minScheduleIntervalDays: number;
  maxDoseNumber: number;
  defaultPageSize: number;
}

export class ScheduleService {
  private static instance: ScheduleService;
  private readonly scheduleRepo = new ScheduleRepository();
  private readonly eventBus = VaccinationEventBus.getInstance();
  private readonly config: ScheduleEngineConfig;

  private constructor(config?: Partial<ScheduleEngineConfig>) {
    this.config = {
      reminderDaysBeforeDue:
        config?.reminderDaysBeforeDue ?? DEFAULT_CONFIG.REMINDER_DAYS_BEFORE_DUE,
      overdueGracePeriodDays:
        config?.overdueGracePeriodDays ?? DEFAULT_CONFIG.OVERDUE_GRACE_PERIOD_DAYS,
      minScheduleIntervalDays:
        config?.minScheduleIntervalDays ?? DEFAULT_CONFIG.MIN_SCHEDULE_INTERVAL_DAYS,
      maxDoseNumber:
        config?.maxDoseNumber ?? DEFAULT_CONFIG.MAX_DOSE_NUMBER,
      defaultPageSize:
        config?.defaultPageSize ?? DEFAULT_CONFIG.DEFAULT_PAGE_SIZE,
    };
  }

  public static getInstance(config?: Partial<ScheduleEngineConfig>): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService(config);
    }
    return ScheduleService.instance;
  }

  public reconfigure(config: Partial<ScheduleEngineConfig>): void {
    Object.assign(this.config, config);
  }

  public async createSchedule(
    scheduleData: Omit<
      VaccineSchedule,
      'scheduleId' | 'status' | 'metadata'
    >,
    context: {
      ownerId: string;
      createdBy: string;
      encounterDate: Date;
    },
  ): Promise<string> {
    const scheduleId = ulid();

    if (scheduleData.doseNumber < 1 || scheduleData.doseNumber > this.config.maxDoseNumber) {
      throw new ScheduleValidationError(
        `Dose number must be between 1 and ${this.config.maxDoseNumber}.`,
      );
    }

    const schedule: VaccineSchedule = {
      ...scheduleData,
      scheduleId,
      status: 'SCHEDULED',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: context.createdBy,
        updatedBy: context.createdBy,
        version: 1,
        status: VAULT_STATUS.ACTIVE,
        source: 'citizen',
        ownerId: context.ownerId,
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
    };

    await this.scheduleRepo.create(schedule);

    await this.eventBus.publish('VaccinationScheduled', {
      schedule,
      scheduledBy: context.createdBy,
      timestamp: new Date(),
    });

    return scheduleId;
  }

  public async calculateDueDate(
    vaccine: Vaccine,
    doseNumber: number,
  ): Promise<Date> {
    if (doseNumber < 1 || doseNumber > vaccine.totalDoses) {
      throw new ScheduleValidationError(
        `Dose number ${doseNumber} is out of range for vaccine "${vaccine.name}".`,
      );
    }

    if (doseNumber === 1) {
      return new Date();
    }

    const intervalIndex = Math.min(
      doseNumber - 2,
      vaccine.doseIntervalDays.length - 1,
    );
    const intervalDays = vaccine.doseIntervalDays[intervalIndex];

    if (intervalDays < this.config.minScheduleIntervalDays) {
      throw new ScheduleValidationError(
        `Interval ${intervalDays} days is below minimum of ${this.config.minScheduleIntervalDays} days.`,
      );
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + intervalDays);
    return dueDate;
  }

  public async calculateBoosterDueDate(
    vaccination: VaccinationRecord,
  ): Promise<Date | null> {
    if (vaccination.doseNumber < vaccination.totalDoses) {
      return null;
    }

    const boosterIntervalDays = this.getBoosterIntervalDays(
      vaccination.vaccineName,
    );
    if (boosterIntervalDays <= 0) {
      return null;
    }

    const administeredAt =
      vaccination.administeredAt instanceof Date
        ? vaccination.administeredAt
        : new Date();

    const dueDate = new Date(administeredAt);
    dueDate.setDate(dueDate.getDate() + boosterIntervalDays);
    return dueDate;
  }

  public async calculateMissedVaccines(
    patientId: string,
  ): Promise<VaccineSchedule[]> {
    const schedules = await this.scheduleRepo.getByPatientId(patientId);
    const now = new Date();

    return schedules.filter((s) => {
      if (s.status === 'ADMINISTERED' || s.status === 'CANCELLED') {
        return false;
      }

      const dueDate =
        s.dueDate instanceof Date ? s.dueDate : new Date(s.dueDate as string);
      const diffDays = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays > this.config.overdueGracePeriodDays;
    });
  }

  public async calculateCatchUpSchedule(
    patientId: string,
    missedVaccines: VaccineSchedule[],
  ): Promise<VaccineSchedule[]> {
    const catchUpSchedules: VaccineSchedule[] = [];
    const now = new Date();

    for (const missed of missedVaccines) {
      const catchUpSchedule: VaccineSchedule = {
        scheduleId: ulid(),
        patientId,
        patientName: missed.patientName,
        vaccineName: missed.vaccineName,
        diseaseTargeted: missed.diseaseTargeted,
        category: missed.category,
        status: 'SCHEDULED',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        scheduledDate: now,
        doseNumber: missed.doseNumber,
        totalDoses: missed.totalDoses,
        notes: `Catch-up for missed dose ${missed.doseNumber} of ${missed.vaccineName}`,
        metadata: {
          createdAt: now,
          updatedAt: now,
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
      };

      catchUpSchedules.push(catchUpSchedule);
    }

    return catchUpSchedules;
  }

  private getBoosterIntervalDays(vaccineName: string): number {
    const name = vaccineName.toLowerCase();

    if (name.includes('tetanus') || name.includes('td')) return 3650;
    if (name.includes('covid')) return 365;
    if (name.includes('flu') || name.includes('influenza')) return 365;
    if (name.includes('hepatitis b') || name.includes('hepb')) return 1825;
    if (name.includes('hpv')) return 0;
    if (name.includes('mmr')) return 0;
    if (name.includes('bcg')) return 0;

    return 365;
  }
}
