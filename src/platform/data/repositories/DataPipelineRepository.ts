import { DataPipeline } from '../types';

export class DataPipelineRepository {
  private static instance: DataPipelineRepository;
  private data: Map<string, DataPipeline> = new Map();

  private constructor() {}

  public static getInstance(): DataPipelineRepository {
    if (!DataPipelineRepository.instance) {
      DataPipelineRepository.instance = new DataPipelineRepository();
    }
    return DataPipelineRepository.instance;
  }

  public async save(entity: DataPipeline): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataPipeline | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataPipeline[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
