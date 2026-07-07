import { DatasetProfile } from '../types';
import { DatasetProfileRepository } from '../repositories/DatasetProfileRepository';

export class DatasetProfileService {
  private static instance: DatasetProfileService;
  private repo = DatasetProfileRepository.getInstance();

  private constructor() {}

  public static getInstance(): DatasetProfileService {
    if (!DatasetProfileService.instance) {
      DatasetProfileService.instance = new DatasetProfileService();
    }
    return DatasetProfileService.instance;
  }

  public async create(data: DatasetProfile): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DatasetProfile | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DatasetProfile[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
