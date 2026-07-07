import { ReleasePlan } from '../types';
import { ReleasePlanRepository } from '../repositories/ReleasePlanRepository';

export class ReleasePlanService {
  private static instance: ReleasePlanService;
  private repo = ReleasePlanRepository.getInstance();

  private constructor() {}

  public static getInstance(): ReleasePlanService {
    if (!ReleasePlanService.instance) {
      ReleasePlanService.instance = new ReleasePlanService();
    }
    return ReleasePlanService.instance;
  }

  public async create(data: ReleasePlan): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ReleasePlan | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ReleasePlan[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
