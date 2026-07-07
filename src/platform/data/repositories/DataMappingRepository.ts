import { DataMapping } from '../types';

export class DataMappingRepository {
  private static instance: DataMappingRepository;
  private data: Map<string, DataMapping> = new Map();

  private constructor() {}

  public static getInstance(): DataMappingRepository {
    if (!DataMappingRepository.instance) {
      DataMappingRepository.instance = new DataMappingRepository();
    }
    return DataMappingRepository.instance;
  }

  public async save(entity: DataMapping): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataMapping | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataMapping[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
