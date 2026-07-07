import { ReleasePipeline } from '../types';

export class ReleasePipelineRepository {
  private static instance: ReleasePipelineRepository;
  private data: Map<string, ReleasePipeline> = new Map();

  private constructor() {}

  public static getInstance(): ReleasePipelineRepository {
    if (!ReleasePipelineRepository.instance) {
      ReleasePipelineRepository.instance = new ReleasePipelineRepository();
    }
    return ReleasePipelineRepository.instance;
  }

  public async save(entity: ReleasePipeline): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ReleasePipeline | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ReleasePipeline[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
