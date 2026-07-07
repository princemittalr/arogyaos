import { DataLineage } from '../types';
import { DataLineageRepository } from '../repositories/DataLineageRepository';

export class DataLineageService {
  private static instance: DataLineageService;
  private repo = DataLineageRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataLineageService {
    if (!DataLineageService.instance) {
      DataLineageService.instance = new DataLineageService();
    }
    return DataLineageService.instance;
  }

  public async create(data: DataLineage): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataLineage | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataLineage[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
