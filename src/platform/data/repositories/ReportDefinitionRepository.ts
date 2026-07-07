import { ReportDefinition } from '../types';

export class ReportDefinitionRepository {
  private static instance: ReportDefinitionRepository;
  private data: Map<string, ReportDefinition> = new Map();

  private constructor() {}

  public static getInstance(): ReportDefinitionRepository {
    if (!ReportDefinitionRepository.instance) {
      ReportDefinitionRepository.instance = new ReportDefinitionRepository();
    }
    return ReportDefinitionRepository.instance;
  }

  public async save(entity: ReportDefinition): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ReportDefinition | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ReportDefinition[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
