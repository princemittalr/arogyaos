import { DataRetentionPolicy } from '../types';

export class DataRetentionPolicyRepository {
  private static instance: DataRetentionPolicyRepository;
  private data: Map<string, DataRetentionPolicy> = new Map();

  private constructor() {}

  public static getInstance(): DataRetentionPolicyRepository {
    if (!DataRetentionPolicyRepository.instance) {
      DataRetentionPolicyRepository.instance = new DataRetentionPolicyRepository();
    }
    return DataRetentionPolicyRepository.instance;
  }

  public async save(entity: DataRetentionPolicy): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataRetentionPolicy | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataRetentionPolicy[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
