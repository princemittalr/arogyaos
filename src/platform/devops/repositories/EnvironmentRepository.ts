import { Environment } from '../types';

export class EnvironmentRepository {
  private static instance: EnvironmentRepository;
  private data: Map<string, Environment> = new Map();

  private constructor() {}

  public static getInstance(): EnvironmentRepository {
    if (!EnvironmentRepository.instance) {
      EnvironmentRepository.instance = new EnvironmentRepository();
    }
    return EnvironmentRepository.instance;
  }

  public async save(entity: Environment): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<Environment | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<Environment[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
