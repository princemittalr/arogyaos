import { ReleasePlan } from '../types';

export class ReleasePlanRepository {
  private static instance: ReleasePlanRepository;
  private data: Map<string, ReleasePlan> = new Map();

  private constructor() {}

  public static getInstance(): ReleasePlanRepository {
    if (!ReleasePlanRepository.instance) {
      ReleasePlanRepository.instance = new ReleasePlanRepository();
    }
    return ReleasePlanRepository.instance;
  }

  public async save(entity: ReleasePlan): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ReleasePlan | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ReleasePlan[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
