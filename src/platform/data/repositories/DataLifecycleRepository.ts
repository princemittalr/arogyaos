import { DataLifecycle } from '../types';

export class DataLifecycleRepository {
  private static instance: DataLifecycleRepository;
  private data: Map<string, DataLifecycle> = new Map();

  private constructor() {}

  public static getInstance(): DataLifecycleRepository {
    if (!DataLifecycleRepository.instance) {
      DataLifecycleRepository.instance = new DataLifecycleRepository();
    }
    return DataLifecycleRepository.instance;
  }

  public async save(entity: DataLifecycle): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataLifecycle | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataLifecycle[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
