import { DataClassification } from '../types';
import { DataClassificationRepository } from '../repositories/DataClassificationRepository';

export class DataClassificationService {
  private static instance: DataClassificationService;
  private repo = DataClassificationRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataClassificationService {
    if (!DataClassificationService.instance) {
      DataClassificationService.instance = new DataClassificationService();
    }
    return DataClassificationService.instance;
  }

  public async create(data: DataClassification): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataClassification | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataClassification[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
