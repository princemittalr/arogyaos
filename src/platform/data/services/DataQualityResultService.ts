import { DataQualityResult } from '../types';
import { DataQualityResultRepository } from '../repositories/DataQualityResultRepository';

export class DataQualityResultService {
  private static instance: DataQualityResultService;
  private repo = DataQualityResultRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataQualityResultService {
    if (!DataQualityResultService.instance) {
      DataQualityResultService.instance = new DataQualityResultService();
    }
    return DataQualityResultService.instance;
  }

  public async create(data: DataQualityResult): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataQualityResult | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataQualityResult[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
