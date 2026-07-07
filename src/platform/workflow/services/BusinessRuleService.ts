import { BusinessRule } from '../types';
import { BusinessRuleRepository } from '../repositories';
export class BusinessRuleService {
  constructor(private readonly repo: BusinessRuleRepository) {}
  async manageBusinessRule(item: Partial<BusinessRule>): Promise<BusinessRule> { throw new Error('Not implemented'); }
}
