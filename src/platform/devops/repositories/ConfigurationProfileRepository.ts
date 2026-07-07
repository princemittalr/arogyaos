import { ConfigurationProfile } from '../types';

export class ConfigurationProfileRepository {
  private static instance: ConfigurationProfileRepository;
  private data: Map<string, ConfigurationProfile> = new Map();

  private constructor() {}

  public static getInstance(): ConfigurationProfileRepository {
    if (!ConfigurationProfileRepository.instance) {
      ConfigurationProfileRepository.instance = new ConfigurationProfileRepository();
    }
    return ConfigurationProfileRepository.instance;
  }

  public async save(entity: ConfigurationProfile): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ConfigurationProfile | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ConfigurationProfile[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
