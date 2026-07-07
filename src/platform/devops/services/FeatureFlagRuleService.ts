import { FeatureFlagRule } from '../types';
import { FeatureFlagRuleRepository } from '../repositories/FeatureFlagRuleRepository';

export class FeatureFlagRuleService {
  private static instance: FeatureFlagRuleService;
  private repo = FeatureFlagRuleRepository.getInstance();

  private constructor() {}

  public static getInstance(): FeatureFlagRuleService {
    if (!FeatureFlagRuleService.instance) {
      FeatureFlagRuleService.instance = new FeatureFlagRuleService();
    }
    return FeatureFlagRuleService.instance;
  }

  public async create(data: FeatureFlagRule): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<FeatureFlagRule | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<FeatureFlagRule[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
