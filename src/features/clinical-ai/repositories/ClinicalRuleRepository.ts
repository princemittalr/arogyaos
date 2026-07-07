import { ClinicalRule } from '../types';

export class ClinicalRuleRepository {
  async findById(id: string): Promise<ClinicalRule | null> {
    throw new Error('Not implemented');
  }

  async findByCategory(category: string): Promise<ClinicalRule[]> {
    throw new Error('Not implemented');
  }

  async save(rule: ClinicalRule): Promise<ClinicalRule> {
    throw new Error('Not implemented');
  }
}
