import { ServiceDependency } from '../types';

export class ServiceDependencyRepository {
  private static instance: ServiceDependencyRepository;
  private data: Map<string, ServiceDependency> = new Map();

  private constructor() {}

  public static getInstance(): ServiceDependencyRepository {
    if (!ServiceDependencyRepository.instance) {
      ServiceDependencyRepository.instance = new ServiceDependencyRepository();
    }
    return ServiceDependencyRepository.instance;
  }

  public async save(entity: ServiceDependency): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ServiceDependency | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ServiceDependency[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
