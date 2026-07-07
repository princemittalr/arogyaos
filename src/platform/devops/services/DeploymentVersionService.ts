import { DeploymentVersion } from '../types';
import { DeploymentVersionRepository } from '../repositories/DeploymentVersionRepository';

export class DeploymentVersionService {
  private static instance: DeploymentVersionService;
  private repo = DeploymentVersionRepository.getInstance();

  private constructor() {}

  public static getInstance(): DeploymentVersionService {
    if (!DeploymentVersionService.instance) {
      DeploymentVersionService.instance = new DeploymentVersionService();
    }
    return DeploymentVersionService.instance;
  }

  public async create(data: DeploymentVersion): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DeploymentVersion | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DeploymentVersion[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
