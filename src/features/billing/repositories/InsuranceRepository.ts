import { InsurancePolicy, InsuranceProvider } from '../types';

export class InsuranceRepository {
  async findPolicyById(id: string): Promise<InsurancePolicy | null> {
    throw new Error('Not implemented');
  }

  async savePolicy(policy: InsurancePolicy): Promise<InsurancePolicy> {
    throw new Error('Not implemented');
  }

  async findPoliciesByPatient(patientId: string): Promise<InsurancePolicy[]> {
    throw new Error('Not implemented');
  }

  async getProvider(providerId: string): Promise<InsuranceProvider | null> {
    throw new Error('Not implemented');
  }
}
