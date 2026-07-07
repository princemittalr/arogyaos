import { PipelineExecution } from '../types';

export class PipelineExecutionRepository {
  private static instance: PipelineExecutionRepository;
  private data: Map<string, PipelineExecution> = new Map();

  private constructor() {}

  public static getInstance(): PipelineExecutionRepository {
    if (!PipelineExecutionRepository.instance) {
      PipelineExecutionRepository.instance = new PipelineExecutionRepository();
    }
    return PipelineExecutionRepository.instance;
  }

  public async save(entity: PipelineExecution): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<PipelineExecution | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<PipelineExecution[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
