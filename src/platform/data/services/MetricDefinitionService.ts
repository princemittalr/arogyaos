import { MetricDefinition } from '../types';
import { MetricDefinitionRepository } from '../repositories/MetricDefinitionRepository';

export class MetricDefinitionService {
  private static instance: MetricDefinitionService;
  private repo = MetricDefinitionRepository.getInstance();

  private constructor() {}

  public static getInstance(): MetricDefinitionService {
    if (!MetricDefinitionService.instance) {
      MetricDefinitionService.instance = new MetricDefinitionService();
    }
    return MetricDefinitionService.instance;
  }

  public async create(data: MetricDefinition): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MetricDefinition | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MetricDefinition[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
