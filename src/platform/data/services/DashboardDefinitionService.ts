import { DashboardDefinition } from '../types';
import { DashboardDefinitionRepository } from '../repositories/DashboardDefinitionRepository';

export class DashboardDefinitionService {
  private static instance: DashboardDefinitionService;
  private repo = DashboardDefinitionRepository.getInstance();

  private constructor() {}

  public static getInstance(): DashboardDefinitionService {
    if (!DashboardDefinitionService.instance) {
      DashboardDefinitionService.instance = new DashboardDefinitionService();
    }
    return DashboardDefinitionService.instance;
  }

  public async create(data: DashboardDefinition): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DashboardDefinition | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DashboardDefinition[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
