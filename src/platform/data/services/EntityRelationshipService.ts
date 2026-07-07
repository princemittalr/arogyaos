import { EntityRelationship } from '../types';
import { EntityRelationshipRepository } from '../repositories/EntityRelationshipRepository';

export class EntityRelationshipService {
  private static instance: EntityRelationshipService;
  private repo = EntityRelationshipRepository.getInstance();

  private constructor() {}

  public static getInstance(): EntityRelationshipService {
    if (!EntityRelationshipService.instance) {
      EntityRelationshipService.instance = new EntityRelationshipService();
    }
    return EntityRelationshipService.instance;
  }

  public async create(data: EntityRelationship): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<EntityRelationship | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<EntityRelationship[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
