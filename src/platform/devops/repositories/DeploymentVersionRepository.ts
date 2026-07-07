import { DeploymentVersion } from '../types';

export class DeploymentVersionRepository {
  private static instance: DeploymentVersionRepository;
  private data: Map<string, DeploymentVersion> = new Map();

  private constructor() {}

  public static getInstance(): DeploymentVersionRepository {
    if (!DeploymentVersionRepository.instance) {
      DeploymentVersionRepository.instance = new DeploymentVersionRepository();
    }
    return DeploymentVersionRepository.instance;
  }

  public async save(entity: DeploymentVersion): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DeploymentVersion | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DeploymentVersion[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
