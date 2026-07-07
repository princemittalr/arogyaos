import { EscalationRule } from '../types';
import { EscalationRuleRepository } from '../repositories';
export class EscalationRuleService {
  constructor(private readonly repo: EscalationRuleRepository) {}
  async manageEscalationRule(item: Partial<EscalationRule>): Promise<EscalationRule> { throw new Error('Not implemented'); }
}
