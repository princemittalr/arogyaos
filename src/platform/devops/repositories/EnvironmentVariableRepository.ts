import { EnvironmentVariable } from '../types';

export class EnvironmentVariableRepository {
  private static instance: EnvironmentVariableRepository;
  private data: Map<string, EnvironmentVariable> = new Map();

  private constructor() {}

  public static getInstance(): EnvironmentVariableRepository {
    if (!EnvironmentVariableRepository.instance) {
      EnvironmentVariableRepository.instance = new EnvironmentVariableRepository();
    }
    return EnvironmentVariableRepository.instance;
  }

  public async save(entity: EnvironmentVariable): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<EnvironmentVariable | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<EnvironmentVariable[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
