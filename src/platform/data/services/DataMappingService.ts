import { DataMapping } from '../types';
import { DataMappingRepository } from '../repositories/DataMappingRepository';

export class DataMappingService {
  private static instance: DataMappingService;
  private repo = DataMappingRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataMappingService {
    if (!DataMappingService.instance) {
      DataMappingService.instance = new DataMappingService();
    }
    return DataMappingService.instance;
  }

  public async create(data: DataMapping): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataMapping | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataMapping[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
