import { DataCatalog } from '../types';

export class DataCatalogRepository {
  private static instance: DataCatalogRepository;
  private data: Map<string, DataCatalog> = new Map();

  private constructor() {}

  public static getInstance(): DataCatalogRepository {
    if (!DataCatalogRepository.instance) {
      DataCatalogRepository.instance = new DataCatalogRepository();
    }
    return DataCatalogRepository.instance;
  }

  public async save(entity: DataCatalog): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataCatalog | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataCatalog[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
