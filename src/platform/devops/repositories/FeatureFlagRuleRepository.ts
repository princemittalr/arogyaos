import { FeatureFlagRule } from '../types';

export class FeatureFlagRuleRepository {
  private static instance: FeatureFlagRuleRepository;
  private data: Map<string, FeatureFlagRule> = new Map();

  private constructor() {}

  public static getInstance(): FeatureFlagRuleRepository {
    if (!FeatureFlagRuleRepository.instance) {
      FeatureFlagRuleRepository.instance = new FeatureFlagRuleRepository();
    }
    return FeatureFlagRuleRepository.instance;
  }

  public async save(entity: FeatureFlagRule): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<FeatureFlagRule | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<FeatureFlagRule[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
