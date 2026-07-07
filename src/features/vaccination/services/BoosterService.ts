import { ulid } from '@/features/health-vault/utils/ulid';
import { VAULT_STATUS, FHIR_CONFIG } from '@/features/health-vault/core/constants';
import { VaccinationRepository } from '../repositories/VaccinationRepository';
import { VaccinationEventBus } from '../core/events';
import {
  VaccinationRecord,
  BoosterRecord,
} from '../types';

export interface BoosterEligibilityResult {
  eligible: boolean;
  dueDate: Date | null;
  reason: string;
}

export class BoosterService {
  private static instance: BoosterService;
  private readonly vaccinationRepo = new VaccinationRepository();
  private readonly eventBus = VaccinationEventBus.getInstance();

  private constructor() {}

  public static getInstance(): BoosterService {
    if (!BoosterService.instance) {
      BoosterService.instance = new BoosterService();
    }
    return BoosterService.instance;
  }

  public async checkEligibility(
    vaccination: VaccinationRecord,
  ): Promise<BoosterEligibilityResult> {
    if (vaccination.doseNumber < vaccination.totalDoses) {
      return {
        eligible: false,
        dueDate: null,
        reason: `Vaccination series not complete. Dose ${vaccination.doseNumber} of ${vaccination.totalDoses}.`,
      };
    }

    const boosterIntervalDays = this.getBoosterIntervalDays(
      vaccination.vaccineName,
    );

    if (boosterIntervalDays <= 0) {
      return {
        eligible: false,
        dueDate: null,
        reason: `No booster recommendation available for ${vaccination.vaccineName}.`,
      };
    }

    const administeredAt =
      vaccination.administeredAt instanceof Date
        ? vaccination.administeredAt
        : new Date(vaccination.administeredAt as string);

    const dueDate = new Date(administeredAt);
    dueDate.setDate(dueDate.getDate() + boosterIntervalDays);

    const now = new Date();
    const eligible = now >= dueDate;

    return {
      eligible,
      dueDate,
      reason: eligible
        ? `Booster for ${vaccination.vaccineName} is due.`
        : `Booster for ${vaccination.vaccineName} is due on ${dueDate.toISOString().split('T')[0]}.`,
    };
  }

  public async getBoosterHistory(
    patientId: string,
  ): Promise<BoosterRecord[]> {
    const vaccinations =
      await this.vaccinationRepo.getByPatientId(patientId);
    const boosters: BoosterRecord[] = [];

    for (const vac of vaccinations) {
      if (vac.doseNumber === vac.totalDoses) {
        const eligibility = await this.checkEligibility(vac);

        const boosterRecord: BoosterRecord = {
          recordId: ulid(),
          ownerId: patientId,
          boosterId: ulid(),
          originalVaccinationId: vac.vaccinationId,
          patientId,
          patientName: vac.patientName,
          vaccineName: vac.vaccineName,
          diseaseTargeted: vac.diseaseTargeted,
          category: vac.category,
          doseNumber: vac.doseNumber,
          totalDoses: vac.totalDoses,
          dueDate: eligibility.dueDate ?? new Date(),
          administeredAt: undefined,
          administeredBy: undefined,
          status: vac.status,
          notes: eligibility.reason,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
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

        boosters.push(boosterRecord);
      }
    }

    return boosters;
  }

  public async getBoosterRecommendations(
    patientId: string,
  ): Promise<BoosterRecord[]> {
    const vaccinations =
      await this.vaccinationRepo.getByPatientId(patientId);
    const recommendations: BoosterRecord[] = [];

    for (const vac of vaccinations) {
      if (vac.doseNumber < vac.totalDoses) {
        continue;
      }

      const eligibility = await this.checkEligibility(vac);

      if (!eligibility.eligible) {
        continue;
      }

      const boosterRecord: BoosterRecord = {
        recordId: ulid(),
        ownerId: patientId,
        boosterId: ulid(),
        originalVaccinationId: vac.vaccinationId,
        patientId,
        patientName: vac.patientName,
        vaccineName: vac.vaccineName,
        diseaseTargeted: vac.diseaseTargeted,
        category: vac.category,
        doseNumber: vac.doseNumber,
        totalDoses: vac.totalDoses,
        dueDate: eligibility.dueDate ?? new Date(),
        administeredAt: undefined,
        administeredBy: undefined,
        status: vac.status,
        notes: `Booster recommended: ${eligibility.reason}`,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
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

      recommendations.push(boosterRecord);
    }

    return recommendations;
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
