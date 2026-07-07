import { PipelineStage } from '../types';
import { PipelineStageRepository } from '../repositories/PipelineStageRepository';

export class PipelineStageService {
  private static instance: PipelineStageService;
  private repo = PipelineStageRepository.getInstance();

  private constructor() {}

  public static getInstance(): PipelineStageService {
    if (!PipelineStageService.instance) {
      PipelineStageService.instance = new PipelineStageService();
    }
    return PipelineStageService.instance;
  }

  public async create(data: PipelineStage): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<PipelineStage | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<PipelineStage[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
