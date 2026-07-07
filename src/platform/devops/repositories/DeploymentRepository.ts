import { Deployment } from '../types';

export class DeploymentRepository {
  private static instance: DeploymentRepository;
  private data: Map<string, Deployment> = new Map();

  private constructor() {}

  public static getInstance(): DeploymentRepository {
    if (!DeploymentRepository.instance) {
      DeploymentRepository.instance = new DeploymentRepository();
    }
    return DeploymentRepository.instance;
  }

  public async save(entity: Deployment): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<Deployment | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<Deployment[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
