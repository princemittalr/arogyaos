import { DataSteward } from '../types';
import { DataStewardRepository } from '../repositories/DataStewardRepository';

export class DataStewardService {
  private static instance: DataStewardService;
  private repo = DataStewardRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataStewardService {
    if (!DataStewardService.instance) {
      DataStewardService.instance = new DataStewardService();
    }
    return DataStewardService.instance;
  }

  public async create(data: DataSteward): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataSteward | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataSteward[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
