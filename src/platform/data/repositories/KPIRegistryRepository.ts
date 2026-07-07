import { KPIRegistry } from '../types';

export class KPIRegistryRepository {
  private static instance: KPIRegistryRepository;
  private data: Map<string, KPIRegistry> = new Map();

  private constructor() {}

  public static getInstance(): KPIRegistryRepository {
    if (!KPIRegistryRepository.instance) {
      KPIRegistryRepository.instance = new KPIRegistryRepository();
    }
    return KPIRegistryRepository.instance;
  }

  public async save(entity: KPIRegistry): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<KPIRegistry | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<KPIRegistry[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
