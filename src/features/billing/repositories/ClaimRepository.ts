import { InsuranceClaim, ClaimStatus } from '../types';

export class ClaimRepository {
  async findById(id: string): Promise<InsuranceClaim | null> {
    throw new Error('Not implemented');
  }

  async save(claim: InsuranceClaim): Promise<InsuranceClaim> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: ClaimStatus): Promise<void> {
    throw new Error('Not implemented');
  }

  async findByPolicyId(policyId: string): Promise<InsuranceClaim[]> {
    throw new Error('Not implemented');
  }
}
