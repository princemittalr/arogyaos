import { DataVersion } from '../types';

export class DataVersionRepository {
  private static instance: DataVersionRepository;
  private data: Map<string, DataVersion> = new Map();

  private constructor() {}

  public static getInstance(): DataVersionRepository {
    if (!DataVersionRepository.instance) {
      DataVersionRepository.instance = new DataVersionRepository();
    }
    return DataVersionRepository.instance;
  }

  public async save(entity: DataVersion): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataVersion | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataVersion[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
