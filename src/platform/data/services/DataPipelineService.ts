import { DataPipeline } from '../types';
import { DataPipelineRepository } from '../repositories/DataPipelineRepository';

export class DataPipelineService {
  private static instance: DataPipelineService;
  private repo = DataPipelineRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataPipelineService {
    if (!DataPipelineService.instance) {
      DataPipelineService.instance = new DataPipelineService();
    }
    return DataPipelineService.instance;
  }

  public async create(data: DataPipeline): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataPipeline | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataPipeline[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
