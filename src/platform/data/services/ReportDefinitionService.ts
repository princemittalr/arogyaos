import { ReportDefinition } from '../types';
import { ReportDefinitionRepository } from '../repositories/ReportDefinitionRepository';

export class ReportDefinitionService {
  private static instance: ReportDefinitionService;
  private repo = ReportDefinitionRepository.getInstance();

  private constructor() {}

  public static getInstance(): ReportDefinitionService {
    if (!ReportDefinitionService.instance) {
      ReportDefinitionService.instance = new ReportDefinitionService();
    }
    return ReportDefinitionService.instance;
  }

  public async create(data: ReportDefinition): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ReportDefinition | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ReportDefinition[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
