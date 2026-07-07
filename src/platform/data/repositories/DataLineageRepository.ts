import { DataLineage } from '../types';

export class DataLineageRepository {
  private static instance: DataLineageRepository;
  private data: Map<string, DataLineage> = new Map();

  private constructor() {}

  public static getInstance(): DataLineageRepository {
    if (!DataLineageRepository.instance) {
      DataLineageRepository.instance = new DataLineageRepository();
    }
    return DataLineageRepository.instance;
  }

  public async save(entity: DataLineage): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataLineage | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataLineage[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
