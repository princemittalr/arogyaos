import { MetricDefinition } from '../types';

export class MetricDefinitionRepository {
  private static instance: MetricDefinitionRepository;
  private data: Map<string, MetricDefinition> = new Map();

  private constructor() {}

  public static getInstance(): MetricDefinitionRepository {
    if (!MetricDefinitionRepository.instance) {
      MetricDefinitionRepository.instance = new MetricDefinitionRepository();
    }
    return MetricDefinitionRepository.instance;
  }

  public async save(entity: MetricDefinition): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MetricDefinition | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MetricDefinition[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
