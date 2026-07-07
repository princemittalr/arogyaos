import { Admission, Discharge, AdmissionStatus } from '../types';

export class AdmissionRepository {
  async findById(id: string): Promise<Admission | null> {
    throw new Error('Not implemented');
  }

  async findByPatient(patientId: string): Promise<Admission[]> {
    throw new Error('Not implemented');
  }

  async save(admission: Admission): Promise<Admission> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: AdmissionStatus): Promise<void> {
    throw new Error('Not implemented');
  }

  async saveDischarge(discharge: Discharge): Promise<Discharge> {
    throw new Error('Not implemented');
  }
}
