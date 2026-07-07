import { DataQualityRule } from '../types';

export class DataQualityRuleRepository {
  private static instance: DataQualityRuleRepository;
  private data: Map<string, DataQualityRule> = new Map();

  private constructor() {}

  public static getInstance(): DataQualityRuleRepository {
    if (!DataQualityRuleRepository.instance) {
      DataQualityRuleRepository.instance = new DataQualityRuleRepository();
    }
    return DataQualityRuleRepository.instance;
  }

  public async save(entity: DataQualityRule): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataQualityRule | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataQualityRule[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
