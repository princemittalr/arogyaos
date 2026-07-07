import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { CertificateRepository } from '../repositories/CertificateRepository';
import { VaccinationRepository } from '../repositories/VaccinationRepository';
import { VaccinationCertificate } from '../types';
import { CertificateNotFoundError, VaccinationNotFoundError } from '../core/errors';
import { VaccinationEventBus } from '../core/events';

export class CertificateGenerationService {
  private static certRepo = new CertificateRepository();
  private static vaccinationRepo = new VaccinationRepository();
  private static vaultService = new HealthVaultService();
  private static eventBus = VaccinationEventBus.getInstance();

  /**
   * Generates a secure vaccination certificate.
   */
  public static async generateCertificate(
    vaccinationId: string,
    verifierSignature: string
  ): Promise<string> {
    const vaccination = await this.vaccinationRepo.getById(vaccinationId);
    if (!vaccination) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    const certificateNumber = `VAC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCodeData = `https://arogyaos.gov.in/verify/vaccination/${certificateNumber}`;
    const generatedAt = new Date();

    // Ingest as a medical certificate into Health Vault
    const vaultPayload = {
      ownerId: vaccination.patientId,
      certificateType: 'Vaccination Certificate',
      issueDate: generatedAt,
      expiryDate: vaccination.expiryDate || new Date(generatedAt.getTime() + 365 * 24 * 60 * 60 * 1000),
      diagnoses: [vaccination.diseaseTargeted],
      purpose: `Proof of Immunization for ${vaccination.vaccineName}`,
      practicianId: vaccination.administeredBy || 'SYSTEM',
      practicianName: verifierSignature,
    };

    const recordId = await this.vaultService.ingestRecord('medical_certificate', vaultPayload, {
      ownerId: vaccination.patientId,
      createdBy: vaccination.administeredBy || 'SYSTEM',
      source: 'laboratory', // clinical source
      encounterDate: new Date(),
      origin: {
        deviceId: 'web-portal-01',
        deviceType: 'Desktop',
        platform: 'ArogyaOS Enterprise',
        browser: 'Secure-Agent',
        appVersion: '1.4.0',
      },
      summaryFields: {
        title: `Vaccination Certificate: ${vaccination.vaccineName}`,
        providerName: verifierSignature,
        hospitalName: vaccination.facilityName || 'Government Immunization Center',
      },
    });

    const certificate: VaccinationCertificate = {
      recordId,
      ownerId: vaccination.patientId,
      certificateId: recordId,
      vaccinationId,
      certificateNumber,
      qrCodeData,
      generatedAt,
      pdfUrl: `/api/vault/certificates/${recordId}/pdf`,
      patientId: vaccination.patientId,
      patientName: vaccination.patientName,
      vaccineName: vaccination.vaccineName,
      administeredAt: vaccination.administeredAt || generatedAt,
      facilityName: vaccination.facilityName || 'Default Facility',
      verifierSignature,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: vaccination.administeredBy || 'SYSTEM',
        updatedBy: vaccination.administeredBy || 'SYSTEM',
        version: 1,
        status: 'ACTIVE' as const,
        source: 'laboratory',
        ownerId: vaccination.patientId,
        origin: {
          deviceId: 'web-portal-01',
          deviceType: 'Desktop',
          platform: 'ArogyaOS Enterprise',
          browser: 'Secure-Agent',
          appVersion: '1.4.0',
        },
        verification: { isVerified: false },
        interoperability: {
          resourceType: 'DocumentReference' as const,
          fhirVersion: 'R4B',
          hashAlgorithm: 'SHA-256',
          checksumVersion: '1.0.0',
        },
        checksum: `cert-hash-${recordId}`,
      },
    };

    await this.certRepo.create(certificate);

    // Link certificate to vaccination record
    await this.vaccinationRepo.update(vaccinationId, {
      certificateId: recordId,
    });

    // Publish event
    await this.eventBus.publish('CertificateGenerated', {
      certificate,
      timestamp: new Date(),
    });

    return recordId;
  }

  /**
   * Retrieves a certificate by its unique ID.
   */
  public static async getCertificate(certificateId: string): Promise<VaccinationCertificate> {
    const cert = await this.certRepo.getById(certificateId);
    if (!cert) {
      throw new CertificateNotFoundError(certificateId);
    }
    return cert;
  }

  /**
   * Retrieves a certificate by patient ID.
   */
  public static async getCertificatesByPatient(patientId: string): Promise<VaccinationCertificate[]> {
    return await this.certRepo.getByPatientId(patientId);
  }
}
