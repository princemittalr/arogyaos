import { Environment } from '../types';
import { EnvironmentRepository } from '../repositories/EnvironmentRepository';

export class EnvironmentService {
  private static instance: EnvironmentService;
  private repo = EnvironmentRepository.getInstance();

  private constructor() {}

  public static getInstance(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }

  public async create(data: Environment): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<Environment | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<Environment[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
