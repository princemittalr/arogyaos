import { EmergencyCase } from '../types';

export class EmergencyCaseRepository {
  async findById(id: string): Promise<EmergencyCase | null> {
    throw new Error('Not implemented');
  }

  async findByPatientId(patientId: string): Promise<EmergencyCase[]> {
    throw new Error('Not implemented');
  }

  async save(emergencyCase: EmergencyCase): Promise<EmergencyCase> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
