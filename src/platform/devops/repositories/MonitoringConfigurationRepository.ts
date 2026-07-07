import { MonitoringConfiguration } from '../types';

export class MonitoringConfigurationRepository {
  private static instance: MonitoringConfigurationRepository;
  private data: Map<string, MonitoringConfiguration> = new Map();

  private constructor() {}

  public static getInstance(): MonitoringConfigurationRepository {
    if (!MonitoringConfigurationRepository.instance) {
      MonitoringConfigurationRepository.instance = new MonitoringConfigurationRepository();
    }
    return MonitoringConfigurationRepository.instance;
  }

  public async save(entity: MonitoringConfiguration): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MonitoringConfiguration | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MonitoringConfiguration[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
