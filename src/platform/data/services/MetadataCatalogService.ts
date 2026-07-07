import { MetadataCatalog } from '../types';
import { MetadataCatalogRepository } from '../repositories/MetadataCatalogRepository';

export class MetadataCatalogService {
  private static instance: MetadataCatalogService;
  private repo = MetadataCatalogRepository.getInstance();

  private constructor() {}

  public static getInstance(): MetadataCatalogService {
    if (!MetadataCatalogService.instance) {
      MetadataCatalogService.instance = new MetadataCatalogService();
    }
    return MetadataCatalogService.instance;
  }

  public async create(data: MetadataCatalog): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MetadataCatalog | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MetadataCatalog[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
