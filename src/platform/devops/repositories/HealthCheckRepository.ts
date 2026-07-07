import { HealthCheck } from '../types';

export class HealthCheckRepository {
  private static instance: HealthCheckRepository;
  private data: Map<string, HealthCheck> = new Map();

  private constructor() {}

  public static getInstance(): HealthCheckRepository {
    if (!HealthCheckRepository.instance) {
      HealthCheckRepository.instance = new HealthCheckRepository();
    }
    return HealthCheckRepository.instance;
  }

  public async save(entity: HealthCheck): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<HealthCheck | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<HealthCheck[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
