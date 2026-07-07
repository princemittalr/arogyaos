import { CommunicationRule } from '../types';

export class CommunicationRuleRepository {
  async save(rule: CommunicationRule): Promise<CommunicationRule> {
    throw new Error('Not implemented');
  }
}
