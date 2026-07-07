import { Dataset } from '../types';
import { DatasetRepository } from '../repositories/DatasetRepository';

export class DatasetService {
  private static instance: DatasetService;
  private repo = DatasetRepository.getInstance();

  private constructor() {}

  public static getInstance(): DatasetService {
    if (!DatasetService.instance) {
      DatasetService.instance = new DatasetService();
    }
    return DatasetService.instance;
  }

  public async create(data: Dataset): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<Dataset | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<Dataset[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
