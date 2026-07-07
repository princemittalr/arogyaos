import { PipelineStep } from '../types';
import { PipelineStepRepository } from '../repositories/PipelineStepRepository';

export class PipelineStepService {
  private static instance: PipelineStepService;
  private repo = PipelineStepRepository.getInstance();

  private constructor() {}

  public static getInstance(): PipelineStepService {
    if (!PipelineStepService.instance) {
      PipelineStepService.instance = new PipelineStepService();
    }
    return PipelineStepService.instance;
  }

  public async create(data: PipelineStep): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<PipelineStep | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<PipelineStep[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
