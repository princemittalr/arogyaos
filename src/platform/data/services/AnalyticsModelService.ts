import { AnalyticsModel } from '../types';
import { AnalyticsModelRepository } from '../repositories/AnalyticsModelRepository';

export class AnalyticsModelService {
  private static instance: AnalyticsModelService;
  private repo = AnalyticsModelRepository.getInstance();

  private constructor() {}

  public static getInstance(): AnalyticsModelService {
    if (!AnalyticsModelService.instance) {
      AnalyticsModelService.instance = new AnalyticsModelService();
    }
    return AnalyticsModelService.instance;
  }

  public async create(data: AnalyticsModel): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<AnalyticsModel | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<AnalyticsModel[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
