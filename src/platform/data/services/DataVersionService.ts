import { DataVersion } from '../types';
import { DataVersionRepository } from '../repositories/DataVersionRepository';

export class DataVersionService {
  private static instance: DataVersionService;
  private repo = DataVersionRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataVersionService {
    if (!DataVersionService.instance) {
      DataVersionService.instance = new DataVersionService();
    }
    return DataVersionService.instance;
  }

  public async create(data: DataVersion): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataVersion | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataVersion[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
