import { PipelineDefinition } from '../types';
import { PipelineDefinitionRepository } from '../repositories/PipelineDefinitionRepository';

export class PipelineDefinitionService {
  private static instance: PipelineDefinitionService;
  private repo = PipelineDefinitionRepository.getInstance();

  private constructor() {}

  public static getInstance(): PipelineDefinitionService {
    if (!PipelineDefinitionService.instance) {
      PipelineDefinitionService.instance = new PipelineDefinitionService();
    }
    return PipelineDefinitionService.instance;
  }

  public async create(data: PipelineDefinition): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<PipelineDefinition | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<PipelineDefinition[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
