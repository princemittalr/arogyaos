import { Dataset } from '../types';

export class DatasetRepository {
  private static instance: DatasetRepository;
  private data: Map<string, Dataset> = new Map();

  private constructor() {}

  public static getInstance(): DatasetRepository {
    if (!DatasetRepository.instance) {
      DatasetRepository.instance = new DatasetRepository();
    }
    return DatasetRepository.instance;
  }

  public async save(entity: Dataset): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<Dataset | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<Dataset[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
