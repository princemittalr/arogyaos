import { DeploymentArtifact } from '../types';

export class DeploymentArtifactRepository {
  private static instance: DeploymentArtifactRepository;
  private data: Map<string, DeploymentArtifact> = new Map();

  private constructor() {}

  public static getInstance(): DeploymentArtifactRepository {
    if (!DeploymentArtifactRepository.instance) {
      DeploymentArtifactRepository.instance = new DeploymentArtifactRepository();
    }
    return DeploymentArtifactRepository.instance;
  }

  public async save(entity: DeploymentArtifact): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DeploymentArtifact | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DeploymentArtifact[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
