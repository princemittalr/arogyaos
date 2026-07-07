import { DataQualityResult } from '../types';

export class DataQualityResultRepository {
  private static instance: DataQualityResultRepository;
  private data: Map<string, DataQualityResult> = new Map();

  private constructor() {}

  public static getInstance(): DataQualityResultRepository {
    if (!DataQualityResultRepository.instance) {
      DataQualityResultRepository.instance = new DataQualityResultRepository();
    }
    return DataQualityResultRepository.instance;
  }

  public async save(entity: DataQualityResult): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataQualityResult | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataQualityResult[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
