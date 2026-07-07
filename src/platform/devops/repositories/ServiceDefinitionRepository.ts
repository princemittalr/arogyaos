import { ServiceDefinition } from '../types';

export class ServiceDefinitionRepository {
  private static instance: ServiceDefinitionRepository;
  private data: Map<string, ServiceDefinition> = new Map();

  private constructor() {}

  public static getInstance(): ServiceDefinitionRepository {
    if (!ServiceDefinitionRepository.instance) {
      ServiceDefinitionRepository.instance = new ServiceDefinitionRepository();
    }
    return ServiceDefinitionRepository.instance;
  }

  public async save(entity: ServiceDefinition): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ServiceDefinition | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ServiceDefinition[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
