import { FeatureFlag } from '../types';

export class FeatureFlagRepository {
  private static instance: FeatureFlagRepository;
  private data: Map<string, FeatureFlag> = new Map();

  private constructor() {}

  public static getInstance(): FeatureFlagRepository {
    if (!FeatureFlagRepository.instance) {
      FeatureFlagRepository.instance = new FeatureFlagRepository();
    }
    return FeatureFlagRepository.instance;
  }

  public async save(entity: FeatureFlag): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<FeatureFlag | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<FeatureFlag[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
