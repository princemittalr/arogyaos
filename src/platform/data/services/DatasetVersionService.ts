import { DatasetVersion } from '../types';
import { DatasetVersionRepository } from '../repositories/DatasetVersionRepository';

export class DatasetVersionService {
  private static instance: DatasetVersionService;
  private repo = DatasetVersionRepository.getInstance();

  private constructor() {}

  public static getInstance(): DatasetVersionService {
    if (!DatasetVersionService.instance) {
      DatasetVersionService.instance = new DatasetVersionService();
    }
    return DatasetVersionService.instance;
  }

  public async create(data: DatasetVersion): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DatasetVersion | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DatasetVersion[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
