import { AssignmentRule } from '../types';
import { AssignmentRuleRepository } from '../repositories';
export class AssignmentRuleService {
  constructor(private readonly repo: AssignmentRuleRepository) {}
  async manageAssignmentRule(item: Partial<AssignmentRule>): Promise<AssignmentRule> { throw new Error('Not implemented'); }
}
