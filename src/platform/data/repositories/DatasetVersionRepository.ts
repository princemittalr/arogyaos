import { DatasetVersion } from '../types';

export class DatasetVersionRepository {
  private static instance: DatasetVersionRepository;
  private data: Map<string, DatasetVersion> = new Map();

  private constructor() {}

  public static getInstance(): DatasetVersionRepository {
    if (!DatasetVersionRepository.instance) {
      DatasetVersionRepository.instance = new DatasetVersionRepository();
    }
    return DatasetVersionRepository.instance;
  }

  public async save(entity: DatasetVersion): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DatasetVersion | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DatasetVersion[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
