import { DeploymentStrategy } from '../types';
import { DeploymentStrategyRepository } from '../repositories/DeploymentStrategyRepository';

export class DeploymentStrategyService {
  private static instance: DeploymentStrategyService;
  private repo = DeploymentStrategyRepository.getInstance();

  private constructor() {}

  public static getInstance(): DeploymentStrategyService {
    if (!DeploymentStrategyService.instance) {
      DeploymentStrategyService.instance = new DeploymentStrategyService();
    }
    return DeploymentStrategyService.instance;
  }

  public async create(data: DeploymentStrategy): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DeploymentStrategy | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DeploymentStrategy[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
