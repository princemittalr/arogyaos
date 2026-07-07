import { DataOwner } from '../types';

export class DataOwnerRepository {
  private static instance: DataOwnerRepository;
  private data: Map<string, DataOwner> = new Map();

  private constructor() {}

  public static getInstance(): DataOwnerRepository {
    if (!DataOwnerRepository.instance) {
      DataOwnerRepository.instance = new DataOwnerRepository();
    }
    return DataOwnerRepository.instance;
  }

  public async save(entity: DataOwner): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataOwner | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataOwner[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
