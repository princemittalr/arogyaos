import { IntegrationRule } from '../types';

export class IntegrationRuleRepository {
  async save(rule: IntegrationRule): Promise<IntegrationRule> {
    throw new Error('Not implemented');
  }
}
