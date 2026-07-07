import { DataProvenance } from '../types';
import { DataProvenanceRepository } from '../repositories/DataProvenanceRepository';

export class DataProvenanceService {
  private static instance: DataProvenanceService;
  private repo = DataProvenanceRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataProvenanceService {
    if (!DataProvenanceService.instance) {
      DataProvenanceService.instance = new DataProvenanceService();
    }
    return DataProvenanceService.instance;
  }

  public async create(data: DataProvenance): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataProvenance | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataProvenance[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
