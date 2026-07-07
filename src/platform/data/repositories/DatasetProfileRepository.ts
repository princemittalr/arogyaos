import { DatasetProfile } from '../types';

export class DatasetProfileRepository {
  private static instance: DatasetProfileRepository;
  private data: Map<string, DatasetProfile> = new Map();

  private constructor() {}

  public static getInstance(): DatasetProfileRepository {
    if (!DatasetProfileRepository.instance) {
      DatasetProfileRepository.instance = new DatasetProfileRepository();
    }
    return DatasetProfileRepository.instance;
  }

  public async save(entity: DatasetProfile): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DatasetProfile | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DatasetProfile[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
