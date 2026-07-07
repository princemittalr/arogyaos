import { EntityDuplicate } from '../types';
import { EntityDuplicateRepository } from '../repositories/EntityDuplicateRepository';

export class EntityDuplicateService {
  private static instance: EntityDuplicateService;
  private repo = EntityDuplicateRepository.getInstance();

  private constructor() {}

  public static getInstance(): EntityDuplicateService {
    if (!EntityDuplicateService.instance) {
      EntityDuplicateService.instance = new EntityDuplicateService();
    }
    return EntityDuplicateService.instance;
  }

  public async create(data: EntityDuplicate): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<EntityDuplicate | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<EntityDuplicate[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
