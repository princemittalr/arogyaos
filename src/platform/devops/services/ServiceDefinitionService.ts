import { ServiceDefinition } from '../types';
import { ServiceDefinitionRepository } from '../repositories/ServiceDefinitionRepository';

export class ServiceDefinitionService {
  private static instance: ServiceDefinitionService;
  private repo = ServiceDefinitionRepository.getInstance();

  private constructor() {}

  public static getInstance(): ServiceDefinitionService {
    if (!ServiceDefinitionService.instance) {
      ServiceDefinitionService.instance = new ServiceDefinitionService();
    }
    return ServiceDefinitionService.instance;
  }

  public async create(data: ServiceDefinition): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ServiceDefinition | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ServiceDefinition[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
