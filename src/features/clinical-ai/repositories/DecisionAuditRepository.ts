import { DecisionAudit } from '../types';

export class DecisionAuditRepository {
  async save(audit: DecisionAudit): Promise<DecisionAudit> {
    throw new Error('Not implemented');
  }

  async findByDecisionId(decisionId: string): Promise<DecisionAudit[]> {
    throw new Error('Not implemented');
  }
}
