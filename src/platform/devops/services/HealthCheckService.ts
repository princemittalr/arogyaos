import { HealthCheck } from '../types';
import { HealthCheckRepository } from '../repositories/HealthCheckRepository';

export class HealthCheckService {
  private static instance: HealthCheckService;
  private repo = HealthCheckRepository.getInstance();

  private constructor() {}

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  public async create(data: HealthCheck): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<HealthCheck | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<HealthCheck[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
