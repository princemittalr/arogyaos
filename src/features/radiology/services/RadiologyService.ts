import { db } from '@/firebase/client';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { RadiologyStudy, RadiologyReport, ImagingSeries, DicomMetadataSummary, KeyImageSlice } from '../types';
import { StudyNotFoundError } from '../core/errors';
import { RadiologyEventBus } from '../core/events';

const vaultService = new HealthVaultService();
const eventBus = RadiologyEventBus.getInstance();

export class RadiologyService {
  /**
   * Schedules a new radiology imaging study.
   */
  public static async scheduleStudy(
    study: Omit<RadiologyStudy, 'recordId' | 'status' | 'series' | 'numberOfSeries' | 'numberOfInstances'>
  ): Promise<string> {
    const studyRef = doc(db, 'radiology_studies', study.studyInstanceUid);

    const fullStudy: RadiologyStudy = {
      ...study,
      ownerId: study.ownerId || study.patientId,
      patientId: study.patientId || study.ownerId,
      recordId: `study_${study.studyInstanceUid}`,
      status: 'registered',
      series: [],
      numberOfSeries: 0,
      numberOfInstances: 0,
      metadata: study.metadata || {
        createdAt: new Date(),
        status: 'ACTIVE',
        version: 1,
        createdBy: study.referredBy,
        hash: 'study-init-hash',
      },
    };

    await setDoc(studyRef, fullStudy);

    await eventBus.publish('StudyScheduled', {
      study: fullStudy,
      schedulerId: study.referredBy,
      timestamp: new Date(),
    });

    return study.studyInstanceUid;
  }

  /**
   * Starts the scan sequence (moving status from registered/scheduled to in-progress).
   */
  public static async startScan(studyInstanceUid: string): Promise<void> {
    const studyRef = doc(db, 'radiology_studies', studyInstanceUid);
    const studySnap = await getDoc(studyRef);

    if (!studySnap.exists()) {
      throw new StudyNotFoundError(studyInstanceUid);
    }

    await updateDoc(studyRef, {
      status: 'in-progress',
      startedAt: new Date().toISOString(),
    });
  }

  /**
   * Completes the scan sequence, uploading series and DICOM metadata indexes.
   */
  public static async completeScan(
    studyInstanceUid: string,
    series: ImagingSeries[],
    dicomMetadata?: DicomMetadataSummary
  ): Promise<void> {
    const studyRef = doc(db, 'radiology_studies', studyInstanceUid);
    const studySnap = await getDoc(studyRef);

    if (!studySnap.exists()) {
      throw new StudyNotFoundError(studyInstanceUid);
    }

    const numberOfSeries = series.length;
    const numberOfInstances = series.reduce((acc, s) => acc + (s.instances?.length || 0), 0);

    const updates = {
      status: 'completed' as const,
      series,
      numberOfSeries,
      numberOfInstances,
      completedAt: new Date().toISOString(),
      ...(dicomMetadata ? { dicomMetadata } : {}),
    };

    await updateDoc(studyRef, updates);

    const updatedStudy = {
      ...(studySnap.data() as RadiologyStudy),
      ...updates,
    };

    await eventBus.publish('StudyCompleted', {
      study: updatedStudy,
      completedAt: new Date(),
    });
  }

  /**
   * Signs and finalizes the radiologist report, storing it inside the Health Vault.
   */
  public static async submitReport(reportData: {
    studyInstanceUid: string;
    patientId: string;
    patientName: string;
    radiologistId: string;
    radiologistName: string;
    findings: string;
    impression: string;
    isCritical: boolean;
    keyImages: KeyImageSlice[];
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
    attachmentMimeType?: string;
  }): Promise<string> {
    const studyRef = doc(db, 'radiology_studies', reportData.studyInstanceUid);
    const studySnap = await getDoc(studyRef);

    if (!studySnap.exists()) {
      throw new StudyNotFoundError(reportData.studyInstanceUid);
    }

    const study = studySnap.data() as RadiologyStudy;

    // Build the vault payload according to frozen schema validations
    const vaultPayload = {
      ownerId: reportData.patientId,
      studyType: `${study.modality} ${study.bodySite}`,
      modality: study.modality,
      bodySite: study.bodySite,
      findingNotes: reportData.findings,
      impression: reportData.impression,
      radiologistId: reportData.radiologistId,
      radiologistName: reportData.radiologistName,
      ...(reportData.attachmentUrl ? {
        attachmentUrl: reportData.attachmentUrl,
        attachmentName: reportData.attachmentName || 'scanned_report.pdf',
        attachmentSize: reportData.attachmentSize || 1024,
        attachmentMimeType: reportData.attachmentMimeType || 'application/pdf',
      } : {}),
    };

    const recordId = await vaultService.ingestRecord('radiology_report', vaultPayload, {
      ownerId: reportData.patientId,
      createdBy: reportData.radiologistId,
      source: 'laboratory', // Use laboratory source as radiology is a clinical diagnostic vault source
      encounterDate: new Date(),
      origin: {
        deviceId: 'ris_workstation_01',
        deviceType: 'desktop',
        platform: 'linux',
        browser: 'chrome-headless',
        appVersion: '1.0.0',
      },
      summaryFields: {
        title: `${study.modality} ${study.bodySite} Imaging Study`,
        providerName: reportData.radiologistName,
        hospitalName: study.hospitalName,
      },
    });

    // Update study with report reference
    await updateDoc(studyRef, {
      reportId: recordId,
    });

    const report: RadiologyReport = {
      reportId: recordId,
      studyInstanceUid: reportData.studyInstanceUid,
      patientId: reportData.patientId,
      patientName: reportData.patientName,
      radiologistId: reportData.radiologistId,
      radiologistName: reportData.radiologistName,
      findings: reportData.findings,
      impression: reportData.impression,
      isCritical: reportData.isCritical,
      status: 'final',
      signedAt: new Date().toISOString(),
      keyImages: reportData.keyImages,
    };

    // Publish event bus announcements
    if (reportData.isCritical) {
      await eventBus.publish('CriticalFindingAlert', {
        studyInstanceUid: reportData.studyInstanceUid,
        patientId: reportData.patientId,
        patientName: reportData.patientName,
        modality: study.modality,
        findings: reportData.findings,
        timestamp: new Date(),
      });
    }

    await eventBus.publish('ReportFinalized', {
      report,
      study,
      radiologistId: reportData.radiologistId,
      timestamp: new Date(),
    });

    return recordId;
  }
}
