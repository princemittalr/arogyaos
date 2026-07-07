import { AnalyticsModel } from '../types';

export class AnalyticsModelRepository {
  private static instance: AnalyticsModelRepository;
  private data: Map<string, AnalyticsModel> = new Map();

  private constructor() {}

  public static getInstance(): AnalyticsModelRepository {
    if (!AnalyticsModelRepository.instance) {
      AnalyticsModelRepository.instance = new AnalyticsModelRepository();
    }
    return AnalyticsModelRepository.instance;
  }

  public async save(entity: AnalyticsModel): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<AnalyticsModel | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<AnalyticsModel[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
