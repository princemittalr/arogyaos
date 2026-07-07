import { ClinicalDecision, DecisionStatus } from '../types';

export class ClinicalDecisionRepository {
  async findById(id: string): Promise<ClinicalDecision | null> {
    throw new Error('Not implemented');
  }

  async findByPatientId(patientId: string): Promise<ClinicalDecision[]> {
    throw new Error('Not implemented');
  }

  async save(decision: ClinicalDecision): Promise<ClinicalDecision> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: DecisionStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
