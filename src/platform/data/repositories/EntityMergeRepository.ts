import { EntityMerge } from '../types';

export class EntityMergeRepository {
  private static instance: EntityMergeRepository;
  private data: Map<string, EntityMerge> = new Map();

  private constructor() {}

  public static getInstance(): EntityMergeRepository {
    if (!EntityMergeRepository.instance) {
      EntityMergeRepository.instance = new EntityMergeRepository();
    }
    return EntityMergeRepository.instance;
  }

  public async save(entity: EntityMerge): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<EntityMerge | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<EntityMerge[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
