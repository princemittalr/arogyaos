import { Deployment } from '../types';
import { DeploymentRepository } from '../repositories/DeploymentRepository';

export class DeploymentService {
  private static instance: DeploymentService;
  private repo = DeploymentRepository.getInstance();

  private constructor() {}

  public static getInstance(): DeploymentService {
    if (!DeploymentService.instance) {
      DeploymentService.instance = new DeploymentService();
    }
    return DeploymentService.instance;
  }

  public async create(data: Deployment): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<Deployment | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<Deployment[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
