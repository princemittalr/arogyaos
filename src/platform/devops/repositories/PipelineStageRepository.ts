import { PipelineStage } from '../types';

export class PipelineStageRepository {
  private static instance: PipelineStageRepository;
  private data: Map<string, PipelineStage> = new Map();

  private constructor() {}

  public static getInstance(): PipelineStageRepository {
    if (!PipelineStageRepository.instance) {
      PipelineStageRepository.instance = new PipelineStageRepository();
    }
    return PipelineStageRepository.instance;
  }

  public async save(entity: PipelineStage): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<PipelineStage | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<PipelineStage[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
