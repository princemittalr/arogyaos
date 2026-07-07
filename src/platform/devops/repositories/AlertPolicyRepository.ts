import { AlertPolicy } from '../types';

export class AlertPolicyRepository {
  private static instance: AlertPolicyRepository;
  private data: Map<string, AlertPolicy> = new Map();

  private constructor() {}

  public static getInstance(): AlertPolicyRepository {
    if (!AlertPolicyRepository.instance) {
      AlertPolicyRepository.instance = new AlertPolicyRepository();
    }
    return AlertPolicyRepository.instance;
  }

  public async save(entity: AlertPolicy): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<AlertPolicy | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<AlertPolicy[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
