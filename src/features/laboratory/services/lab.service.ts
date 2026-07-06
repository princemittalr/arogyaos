import { db } from '@/firebase/client';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';
import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { LabTestRequest, LabReportRecord, LabObservation } from '../types';
import { OrderNotFoundError, InvalidSpecimenError } from '../core/errors';
import { LaboratoryEventBus } from '../core/events';

const vaultService = new HealthVaultService();
const eventBus = LaboratoryEventBus.getInstance();

export class LabService {
  /**
   * Get all requests ordered for a specific hospital
   */
  static async getPendingRequests(hospitalId: string): Promise<LabTestRequest[]> {
    const q = query(
      collection(db, 'lab_requests'),
      where('hospitalId', '==', hospitalId)
    );
    const snap = await getDocs(q);
    
    // Seed default mock requests if database queue is empty
    if (snap.empty) {
      const sampleRequests: LabTestRequest[] = [
        {
          requestId: 'req_cbc_001',
          patientId: 'p-1',
          patientName: 'Anjali Sharma',
          testName: 'Complete Blood Count (CBC)',
          orderedBy: 'Dr. Arjun Mehta',
          hospitalId,
          hospitalName: 'Care Diagnostic Center',
          status: 'ordered',
          orderedAt: new Date().toISOString(),
        },
        {
          requestId: 'req_lipid_002',
          patientId: 'p-2',
          patientName: 'Vikram Malhotra',
          testName: 'Lipid Profile',
          orderedBy: 'Dr. Priya Rao',
          hospitalId,
          hospitalName: 'Care Diagnostic Center',
          status: 'ordered',
          orderedAt: new Date().toISOString(),
        }
      ];

      for (const req of sampleRequests) {
        await setDoc(doc(db, 'lab_requests', req.requestId), req);
      }
      return sampleRequests;
    }

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        orderedAt: data.orderedAt?.toDate ? data.orderedAt.toDate().toISOString() : data.orderedAt,
        specimenCollectedAt: data.specimenCollectedAt?.toDate ? data.specimenCollectedAt.toDate().toISOString() : data.specimenCollectedAt,
      } as LabTestRequest;
    });
  }

  /**
   * Logs specimen collection details for a request order
   */
  static async collectSpecimen(
    requestId: string,
    specimenType: string
  ): Promise<void> {
    if (!specimenType) {
      throw new InvalidSpecimenError('Specimen type is required.');
    }

    const docRef = doc(db, 'lab_requests', requestId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new OrderNotFoundError(requestId);
    }

    const updatedData = {
      status: 'sample_collected' as const,
      specimenType,
      specimenCollectedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, updatedData);

    // Publish event
    const request = { ...(docSnap.data() as LabTestRequest), ...updatedData };
    await eventBus.publish('SampleCollected', {
      request,
      collectorId: 'tech_current_user',
      timestamp: new Date(),
    });
  }

  /**
   * Updates general request status
   */
  static async updateRequestStatus(
    requestId: string,
    status: LabTestRequest['status']
  ): Promise<void> {
    const docRef = doc(db, 'lab_requests', requestId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new OrderNotFoundError(requestId);
    }
    await updateDoc(docRef, { status });
  }

  /**
   * Submits lab test results, uploads record to Health Vault, and finalizes request
   */
  static async submitLabReport(
    requestId: string,
    technicianId: string,
    technicianName: string,
    observations: Omit<LabObservation, 'status'>[]
  ): Promise<string> {
    const requestRef = doc(db, 'lab_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) {
      throw new OrderNotFoundError(requestId);
    }

    const reqData = requestSnap.data() as LabTestRequest;

    // Map and enrich observations with status
    const finalizedObservations: LabObservation[] = observations.map((obs) => ({
      ...obs,
      status: 'final' as const,
    }));

    // Ingest into Health Vault
    const payload: Omit<LabReportRecord, 'recordId' | 'metadata'> = {
      ownerId: reqData.patientId,
      testName: reqData.testName,
      laboratoryId: reqData.hospitalId,
      laboratoryName: reqData.hospitalName,
      technicianId,
      technicianName,
      observations: finalizedObservations,
    };

    const recordId = await vaultService.ingestRecord('lab_report', payload, {
      ownerId: reqData.patientId,
      createdBy: technicianId,
      source: 'laboratory',
      encounterDate: new Date(),
      origin: {
        deviceId: 'lis_terminal_01',
        deviceType: 'desktop',
        platform: 'linux',
        browser: 'chrome-headless',
        appVersion: '1.2.0',
      },
      summaryFields: {
        title: reqData.testName,
        providerName: technicianName,
        hospitalName: reqData.hospitalName,
      },
    });

    // Mark lab request order as completed
    await updateDoc(requestRef, {
      status: 'completed' as const,
      reportRecordId: recordId,
    });

    // Publish Report Finalized Event
    const fullReportRecord = await vaultService.getRecordDetails('lab_report', recordId, {
      actorId: reqData.patientId,
      ownerId: reqData.patientId,
      actorRole: 'citizen',
    }) as LabReportRecord;

    await eventBus.publish('ReportFinalized', {
      report: fullReportRecord,
      technicianId,
      timestamp: new Date(),
    });

    // Check for critical results and publish warning alerts if necessary
    for (const obs of finalizedObservations) {
      if (obs.isAbnormal) {
        await eventBus.publish('CriticalResultAlert', {
          report: fullReportRecord,
          parameterName: obs.parameter,
          value: `${obs.value} ${obs.unit}`,
          timestamp: new Date(),
        });
      }
    }

    return recordId;
  }
}
