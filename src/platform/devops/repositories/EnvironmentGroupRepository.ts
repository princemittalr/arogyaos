import { EnvironmentGroup } from '../types';

export class EnvironmentGroupRepository {
  private static instance: EnvironmentGroupRepository;
  private data: Map<string, EnvironmentGroup> = new Map();

  private constructor() {}

  public static getInstance(): EnvironmentGroupRepository {
    if (!EnvironmentGroupRepository.instance) {
      EnvironmentGroupRepository.instance = new EnvironmentGroupRepository();
    }
    return EnvironmentGroupRepository.instance;
  }

  public async save(entity: EnvironmentGroup): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<EnvironmentGroup | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<EnvironmentGroup[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
