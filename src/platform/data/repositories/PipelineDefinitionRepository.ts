import { PipelineDefinition } from '../types';

export class PipelineDefinitionRepository {
  private static instance: PipelineDefinitionRepository;
  private data: Map<string, PipelineDefinition> = new Map();

  private constructor() {}

  public static getInstance(): PipelineDefinitionRepository {
    if (!PipelineDefinitionRepository.instance) {
      PipelineDefinitionRepository.instance = new PipelineDefinitionRepository();
    }
    return PipelineDefinitionRepository.instance;
  }

  public async save(entity: PipelineDefinition): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<PipelineDefinition | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<PipelineDefinition[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
