import { PipelineStep } from '../types';

export class PipelineStepRepository {
  private static instance: PipelineStepRepository;
  private data: Map<string, PipelineStep> = new Map();

  private constructor() {}

  public static getInstance(): PipelineStepRepository {
    if (!PipelineStepRepository.instance) {
      PipelineStepRepository.instance = new PipelineStepRepository();
    }
    return PipelineStepRepository.instance;
  }

  public async save(entity: PipelineStep): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<PipelineStep | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<PipelineStep[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
