import { DataClassification } from '../types';

export class DataClassificationRepository {
  private static instance: DataClassificationRepository;
  private data: Map<string, DataClassification> = new Map();

  private constructor() {}

  public static getInstance(): DataClassificationRepository {
    if (!DataClassificationRepository.instance) {
      DataClassificationRepository.instance = new DataClassificationRepository();
    }
    return DataClassificationRepository.instance;
  }

  public async save(entity: DataClassification): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataClassification | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataClassification[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
