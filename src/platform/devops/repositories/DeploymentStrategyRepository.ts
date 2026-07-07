import { DeploymentStrategy } from '../types';

export class DeploymentStrategyRepository {
  private static instance: DeploymentStrategyRepository;
  private data: Map<string, DeploymentStrategy> = new Map();

  private constructor() {}

  public static getInstance(): DeploymentStrategyRepository {
    if (!DeploymentStrategyRepository.instance) {
      DeploymentStrategyRepository.instance = new DeploymentStrategyRepository();
    }
    return DeploymentStrategyRepository.instance;
  }

  public async save(entity: DeploymentStrategy): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DeploymentStrategy | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DeploymentStrategy[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
