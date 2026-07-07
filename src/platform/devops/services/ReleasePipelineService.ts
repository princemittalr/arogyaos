import { ReleasePipeline } from '../types';
import { ReleasePipelineRepository } from '../repositories/ReleasePipelineRepository';

export class ReleasePipelineService {
  private static instance: ReleasePipelineService;
  private repo = ReleasePipelineRepository.getInstance();

  private constructor() {}

  public static getInstance(): ReleasePipelineService {
    if (!ReleasePipelineService.instance) {
      ReleasePipelineService.instance = new ReleasePipelineService();
    }
    return ReleasePipelineService.instance;
  }

  public async create(data: ReleasePipeline): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ReleasePipeline | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ReleasePipeline[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
