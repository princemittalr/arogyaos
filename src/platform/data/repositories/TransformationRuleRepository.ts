import { TransformationRule } from '../types';

export class TransformationRuleRepository {
  private static instance: TransformationRuleRepository;
  private data: Map<string, TransformationRule> = new Map();

  private constructor() {}

  public static getInstance(): TransformationRuleRepository {
    if (!TransformationRuleRepository.instance) {
      TransformationRuleRepository.instance = new TransformationRuleRepository();
    }
    return TransformationRuleRepository.instance;
  }

  public async save(entity: TransformationRule): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<TransformationRule | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<TransformationRule[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
