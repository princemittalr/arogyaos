import { DisasterRecoveryPlan } from '../types';

export class DisasterRecoveryRepository {
  private static instance: DisasterRecoveryRepository;
  private data: Map<string, DisasterRecoveryPlan> = new Map();

  private constructor() {}

  public static getInstance(): DisasterRecoveryRepository {
    if (!DisasterRecoveryRepository.instance) {
      DisasterRecoveryRepository.instance = new DisasterRecoveryRepository();
    }
    return DisasterRecoveryRepository.instance;
  }

  public async save(entity: DisasterRecoveryPlan): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DisasterRecoveryPlan | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DisasterRecoveryPlan[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
