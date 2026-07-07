import { InfrastructureResource } from '../types';

export class InfrastructureRepository {
  private static instance: InfrastructureRepository;
  private data: Map<string, InfrastructureResource> = new Map();

  private constructor() {}

  public static getInstance(): InfrastructureRepository {
    if (!InfrastructureRepository.instance) {
      InfrastructureRepository.instance = new InfrastructureRepository();
    }
    return InfrastructureRepository.instance;
  }

  public async save(entity: InfrastructureResource): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<InfrastructureResource | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<InfrastructureResource[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
