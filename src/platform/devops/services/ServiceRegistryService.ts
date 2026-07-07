import { ServiceRegistry } from '../types';
import { ServiceRegistryRepository } from '../repositories/ServiceRegistryRepository';

export class ServiceRegistryService {
  private static instance: ServiceRegistryService;
  private repo = ServiceRegistryRepository.getInstance();

  private constructor() {}

  public static getInstance(): ServiceRegistryService {
    if (!ServiceRegistryService.instance) {
      ServiceRegistryService.instance = new ServiceRegistryService();
    }
    return ServiceRegistryService.instance;
  }

  public async create(data: ServiceRegistry): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ServiceRegistry | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ServiceRegistry[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
