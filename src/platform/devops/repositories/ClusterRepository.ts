import { Cluster } from '../types';

export class ClusterRepository {
  private static instance: ClusterRepository;
  private data: Map<string, Cluster> = new Map();

  private constructor() {}

  public static getInstance(): ClusterRepository {
    if (!ClusterRepository.instance) {
      ClusterRepository.instance = new ClusterRepository();
    }
    return ClusterRepository.instance;
  }

  public async save(entity: Cluster): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<Cluster | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<Cluster[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
