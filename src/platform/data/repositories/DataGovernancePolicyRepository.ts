import { DataGovernancePolicy } from '../types';

export class DataGovernancePolicyRepository {
  private static instance: DataGovernancePolicyRepository;
  private data: Map<string, DataGovernancePolicy> = new Map();

  private constructor() {}

  public static getInstance(): DataGovernancePolicyRepository {
    if (!DataGovernancePolicyRepository.instance) {
      DataGovernancePolicyRepository.instance = new DataGovernancePolicyRepository();
    }
    return DataGovernancePolicyRepository.instance;
  }

  public async save(entity: DataGovernancePolicy): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataGovernancePolicy | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataGovernancePolicy[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
