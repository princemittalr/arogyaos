import { DataLifecycle } from '../types';
import { DataLifecycleRepository } from '../repositories/DataLifecycleRepository';

export class DataLifecycleService {
  private static instance: DataLifecycleService;
  private repo = DataLifecycleRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataLifecycleService {
    if (!DataLifecycleService.instance) {
      DataLifecycleService.instance = new DataLifecycleService();
    }
    return DataLifecycleService.instance;
  }

  public async create(data: DataLifecycle): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataLifecycle | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataLifecycle[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
