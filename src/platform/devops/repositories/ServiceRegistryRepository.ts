import { ServiceRegistry } from '../types';

export class ServiceRegistryRepository {
  private static instance: ServiceRegistryRepository;
  private data: Map<string, ServiceRegistry> = new Map();

  private constructor() {}

  public static getInstance(): ServiceRegistryRepository {
    if (!ServiceRegistryRepository.instance) {
      ServiceRegistryRepository.instance = new ServiceRegistryRepository();
    }
    return ServiceRegistryRepository.instance;
  }

  public async save(entity: ServiceRegistry): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ServiceRegistry | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ServiceRegistry[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
