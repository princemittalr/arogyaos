import { DashboardDefinition } from '../types';

export class DashboardDefinitionRepository {
  private static instance: DashboardDefinitionRepository;
  private data: Map<string, DashboardDefinition> = new Map();

  private constructor() {}

  public static getInstance(): DashboardDefinitionRepository {
    if (!DashboardDefinitionRepository.instance) {
      DashboardDefinitionRepository.instance = new DashboardDefinitionRepository();
    }
    return DashboardDefinitionRepository.instance;
  }

  public async save(entity: DashboardDefinition): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DashboardDefinition | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DashboardDefinition[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
