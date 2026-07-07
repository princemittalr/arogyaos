import { PipelineExecution } from '../types';
import { PipelineExecutionRepository } from '../repositories/PipelineExecutionRepository';

export class PipelineExecutionMetadataService {
  private static instance: PipelineExecutionMetadataService;
  private repo = PipelineExecutionRepository.getInstance();

  private constructor() {}

  public static getInstance(): PipelineExecutionMetadataService {
    if (!PipelineExecutionMetadataService.instance) {
      PipelineExecutionMetadataService.instance = new PipelineExecutionMetadataService();
    }
    return PipelineExecutionMetadataService.instance;
  }

  public async create(data: PipelineExecution): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<PipelineExecution | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<PipelineExecution[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
