import { DeploymentArtifact } from '../types';
import { DeploymentArtifactRepository } from '../repositories/DeploymentArtifactRepository';

export class DeploymentArtifactService {
  private static instance: DeploymentArtifactService;
  private repo = DeploymentArtifactRepository.getInstance();

  private constructor() {}

  public static getInstance(): DeploymentArtifactService {
    if (!DeploymentArtifactService.instance) {
      DeploymentArtifactService.instance = new DeploymentArtifactService();
    }
    return DeploymentArtifactService.instance;
  }

  public async create(data: DeploymentArtifact): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DeploymentArtifact | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DeploymentArtifact[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
