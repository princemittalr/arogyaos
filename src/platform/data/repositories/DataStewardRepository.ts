import { DataSteward } from '../types';

export class DataStewardRepository {
  private static instance: DataStewardRepository;
  private data: Map<string, DataSteward> = new Map();

  private constructor() {}

  public static getInstance(): DataStewardRepository {
    if (!DataStewardRepository.instance) {
      DataStewardRepository.instance = new DataStewardRepository();
    }
    return DataStewardRepository.instance;
  }

  public async save(entity: DataSteward): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataSteward | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataSteward[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
