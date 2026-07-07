import { ulid } from '@/features/health-vault/utils/ulid';
import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { CertificateRepository } from '../repositories/CertificateRepository';
import { VaccinationRepository } from '../repositories/VaccinationRepository';
import { VaccinationEventBus } from '../core/events';
import { VaccineCertificate } from '../types';
import { VaccinationNotFoundError } from '../core/errors';

export interface PdfMetadata {
  title: string;
  subject: string;
  author: string;
  keywords: string[];
  creator: string;
  producer: string;
  creationDate: Date;
}

export interface PrintableMetadata {
  certificateNumber: string;
  patientName: string;
  vaccineName: string;
  diseaseTargeted: string;
  doseInfo: string;
  administeredAt: Date;
  administeredBy: string;
  facilityName: string;
  manufacturer: string;
  batchNumber: string;
  qrCodeData: string;
  issuedAt: Date;
  issuedBy: string;
}

export class CertificateGenerationService {
  private static instance: CertificateGenerationService;
  private readonly certRepo = new CertificateRepository();
  private readonly vaccinationRepo = new VaccinationRepository();
  private readonly vaultService = new HealthVaultService();
  private readonly eventBus = VaccinationEventBus.getInstance();

  private constructor() {}

  public static getInstance(): CertificateGenerationService {
    if (!CertificateGenerationService.instance) {
      CertificateGenerationService.instance =
        new CertificateGenerationService();
    }
    return CertificateGenerationService.instance;
  }

  public async generateCertificate(
    vaccinationId: string,
    generatedBy: string,
  ): Promise<VaccineCertificate> {
    const vaccination = await this.vaccinationRepo.getById(vaccinationId);
    if (!vaccination) {
      throw new VaccinationNotFoundError(vaccinationId);
    }

    const existingCert = await this.certRepo.getByVaccinationId(vaccinationId);
    if (existingCert) {
      return existingCert;
    }

    const certificateId = ulid();
    const certificateNumber = this.generateCertificateId();
    const qrCodeData = this.generateQrPayload({
      certificateNumber,
      vaccinationId,
      patientId: vaccination.patientId,
      vaccineName: vaccination.vaccineName,
    });

    const certificate: VaccineCertificate = {
      recordId: certificateId,
      ownerId: vaccination.ownerId,
      certificateId,
      vaccinationId,
      certificateNumber,
      certificateType: 'IMMUNIZATION_CERTIFICATE',
      qrCodeData,
      generatedAt: new Date(),
      generatedBy,
      pdfUrl: undefined,
      patientId: vaccination.patientId,
      patientName: vaccination.patientName,
      vaccineName: vaccination.vaccineName,
      diseaseTargeted: vaccination.diseaseTargeted,
      doseNumber: vaccination.doseNumber,
      totalDoses: vaccination.totalDoses,
      administeredAt: vaccination.administeredAt,
      administeredBy: vaccination.administeredBy,
      facilityName: vaccination.facilityName,
      verifierSignature: generatedBy,
      expiryDate: new Date(
        Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
      ),
      isRevoked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: generatedBy,
        updatedBy: generatedBy,
        version: 1,
        status: 'ACTIVE' as const,
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
          resourceType: 'DocumentReference',
          fhirVersion: 'R4B',
          hashAlgorithm: 'SHA-256',
          checksumVersion: '1.0.0',
        },
        checksum: '',
      },
    };

    await this.certRepo.create(certificate);

    await this.vaccinationRepo.update(vaccinationId, {
      certificateId,
    });

    await this.eventBus.publish('CertificateGenerated', {
      certificate,
      generatedBy,
      timestamp: new Date(),
    });

    return certificate;
  }

  public getPdfMetadata(certificate: VaccineCertificate): PdfMetadata {
    return {
      title: `Vaccination Certificate - ${certificate.vaccineName}`,
      subject: `Immunization Record for ${certificate.patientName}`,
      author: certificate.generatedBy,
      keywords: [
        'vaccination',
        'immunization',
        certificate.vaccineName,
        certificate.diseaseTargeted,
        'ArogyaOS',
      ],
      creator: 'ArogyaOS Vaccination Module',
      producer: 'ArogyaOS Enterprise',
      creationDate:
        certificate.generatedAt instanceof Date
          ? certificate.generatedAt
          : new Date(),
    };
  }

  public generateCertificateId(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ARV-${ts}-${rand}`;
  }

  public generateQrPayload(data: {
    certificateNumber: string;
    vaccinationId: string;
    patientId: string;
    vaccineName: string;
  }): string {
    return JSON.stringify({
      type: 'AROGYAOS_VACCINATION_CERTIFICATE',
      version: '1.0',
      cert: data.certificateNumber,
      vac: data.vaccinationId,
      pat: data.patientId,
      vax: data.vaccineName,
      ts: Date.now(),
    });
  }

  public getPrintableMetadata(
    certificate: VaccineCertificate,
  ): PrintableMetadata {
    return {
      certificateNumber: certificate.certificateNumber,
      patientName: certificate.patientName,
      vaccineName: certificate.vaccineName,
      diseaseTargeted: certificate.diseaseTargeted,
      doseInfo: `Dose ${certificate.doseNumber} of ${certificate.totalDoses}`,
      administeredAt:
        certificate.administeredAt instanceof Date
          ? certificate.administeredAt
          : new Date(),
      administeredBy: certificate.administeredBy,
      facilityName: certificate.facilityName,
      manufacturer: '',
      batchNumber: '',
      qrCodeData: certificate.qrCodeData,
      issuedAt:
        certificate.generatedAt instanceof Date
          ? certificate.generatedAt
          : new Date(),
      issuedBy: certificate.generatedBy,
    };
  }

  public async getCertificate(
    certificateId: string,
  ): Promise<VaccineCertificate | null> {
    return this.certRepo.getById(certificateId);
  }

  public async getCertificatesByPatient(
    patientId: string,
  ): Promise<VaccineCertificate[]> {
    return this.certRepo.getByPatientId(patientId);
  }
}
