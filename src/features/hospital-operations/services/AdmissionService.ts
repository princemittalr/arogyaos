import { Admission } from '../types';
import { AdmissionRepository } from '../repositories';

export class AdmissionService {
  constructor(private readonly admissionRepository: AdmissionRepository) {}

  async admitPatient(data: Partial<Admission>): Promise<Admission> {
    throw new Error('Not implemented');
  }

  async validateAdmission(data: Partial<Admission>): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async assignInitialWard(admissionId: string, wardId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getAdmissionHistory(patientId: string): Promise<Admission[]> {
    throw new Error('Not implemented');
  }
}
