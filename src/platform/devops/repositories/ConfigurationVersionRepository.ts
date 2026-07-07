import { ConfigurationVersion } from '../types';

export class ConfigurationVersionRepository {
  private static instance: ConfigurationVersionRepository;
  private data: Map<string, ConfigurationVersion> = new Map();

  private constructor() {}

  public static getInstance(): ConfigurationVersionRepository {
    if (!ConfigurationVersionRepository.instance) {
      ConfigurationVersionRepository.instance = new ConfigurationVersionRepository();
    }
    return ConfigurationVersionRepository.instance;
  }

  public async save(entity: ConfigurationVersion): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ConfigurationVersion | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ConfigurationVersion[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
