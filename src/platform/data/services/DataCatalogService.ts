import { DataCatalog } from '../types';
import { DataCatalogRepository } from '../repositories/DataCatalogRepository';

export class DataCatalogService {
  private static instance: DataCatalogService;
  private repo = DataCatalogRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataCatalogService {
    if (!DataCatalogService.instance) {
      DataCatalogService.instance = new DataCatalogService();
    }
    return DataCatalogService.instance;
  }

  public async create(data: DataCatalog): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataCatalog | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataCatalog[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
