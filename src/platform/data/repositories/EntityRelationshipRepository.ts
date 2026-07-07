import { EntityRelationship } from '../types';

export class EntityRelationshipRepository {
  private static instance: EntityRelationshipRepository;
  private data: Map<string, EntityRelationship> = new Map();

  private constructor() {}

  public static getInstance(): EntityRelationshipRepository {
    if (!EntityRelationshipRepository.instance) {
      EntityRelationshipRepository.instance = new EntityRelationshipRepository();
    }
    return EntityRelationshipRepository.instance;
  }

  public async save(entity: EntityRelationship): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<EntityRelationship | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<EntityRelationship[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
