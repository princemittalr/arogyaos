import { EntityMerge } from '../types';
import { EntityMergeRepository } from '../repositories/EntityMergeRepository';

export class EntityMergeService {
  private static instance: EntityMergeService;
  private repo = EntityMergeRepository.getInstance();

  private constructor() {}

  public static getInstance(): EntityMergeService {
    if (!EntityMergeService.instance) {
      EntityMergeService.instance = new EntityMergeService();
    }
    return EntityMergeService.instance;
  }

  public async create(data: EntityMerge): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<EntityMerge | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<EntityMerge[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
