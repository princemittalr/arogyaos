import { EmergencyTreatment } from '../types';

export class TreatmentRepository {
  async findByPatientId(patientId: string): Promise<EmergencyTreatment[]> {
    throw new Error('Not implemented');
  }

  async findByIncidentId(incidentId: string): Promise<EmergencyTreatment[]> {
    throw new Error('Not implemented');
  }

  async save(treatment: EmergencyTreatment): Promise<EmergencyTreatment> {
    throw new Error('Not implemented');
  }
}
