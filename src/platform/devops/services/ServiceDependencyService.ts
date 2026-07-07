import { ServiceDependency } from '../types';
import { ServiceDependencyRepository } from '../repositories/ServiceDependencyRepository';

export class ServiceDependencyService {
  private static instance: ServiceDependencyService;
  private repo = ServiceDependencyRepository.getInstance();

  private constructor() {}

  public static getInstance(): ServiceDependencyService {
    if (!ServiceDependencyService.instance) {
      ServiceDependencyService.instance = new ServiceDependencyService();
    }
    return ServiceDependencyService.instance;
  }

  public async create(data: ServiceDependency): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ServiceDependency | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ServiceDependency[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
