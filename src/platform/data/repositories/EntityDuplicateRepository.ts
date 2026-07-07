import { EntityDuplicate } from '../types';

export class EntityDuplicateRepository {
  private static instance: EntityDuplicateRepository;
  private data: Map<string, EntityDuplicate> = new Map();

  private constructor() {}

  public static getInstance(): EntityDuplicateRepository {
    if (!EntityDuplicateRepository.instance) {
      EntityDuplicateRepository.instance = new EntityDuplicateRepository();
    }
    return EntityDuplicateRepository.instance;
  }

  public async save(entity: EntityDuplicate): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<EntityDuplicate | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<EntityDuplicate[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
