import { CapacityPlan } from '../types';

export class CapacityPlanRepository {
  private static instance: CapacityPlanRepository;
  private data: Map<string, CapacityPlan> = new Map();

  private constructor() {}

  public static getInstance(): CapacityPlanRepository {
    if (!CapacityPlanRepository.instance) {
      CapacityPlanRepository.instance = new CapacityPlanRepository();
    }
    return CapacityPlanRepository.instance;
  }

  public async save(entity: CapacityPlan): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<CapacityPlan | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<CapacityPlan[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
