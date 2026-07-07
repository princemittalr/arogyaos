import { MetadataCatalog } from '../types';

export class MetadataCatalogRepository {
  private static instance: MetadataCatalogRepository;
  private data: Map<string, MetadataCatalog> = new Map();

  private constructor() {}

  public static getInstance(): MetadataCatalogRepository {
    if (!MetadataCatalogRepository.instance) {
      MetadataCatalogRepository.instance = new MetadataCatalogRepository();
    }
    return MetadataCatalogRepository.instance;
  }

  public async save(entity: MetadataCatalog): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MetadataCatalog | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MetadataCatalog[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
