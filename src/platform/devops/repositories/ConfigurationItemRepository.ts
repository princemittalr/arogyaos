import { ConfigurationItem } from '../types';

export class ConfigurationItemRepository {
  private static instance: ConfigurationItemRepository;
  private data: Map<string, ConfigurationItem> = new Map();

  private constructor() {}

  public static getInstance(): ConfigurationItemRepository {
    if (!ConfigurationItemRepository.instance) {
      ConfigurationItemRepository.instance = new ConfigurationItemRepository();
    }
    return ConfigurationItemRepository.instance;
  }

  public async save(entity: ConfigurationItem): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ConfigurationItem | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ConfigurationItem[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
