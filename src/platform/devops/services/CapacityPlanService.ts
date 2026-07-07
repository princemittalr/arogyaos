import { CapacityPlan } from '../types';
import { CapacityPlanRepository } from '../repositories/CapacityPlanRepository';

export class CapacityPlanService {
  private static instance: CapacityPlanService;
  private repo = CapacityPlanRepository.getInstance();

  private constructor() {}

  public static getInstance(): CapacityPlanService {
    if (!CapacityPlanService.instance) {
      CapacityPlanService.instance = new CapacityPlanService();
    }
    return CapacityPlanService.instance;
  }

  public async create(data: CapacityPlan): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<CapacityPlan | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<CapacityPlan[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
