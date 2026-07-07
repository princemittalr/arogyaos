import { DataQualityRule } from '../types';
import { DataQualityRuleRepository } from '../repositories/DataQualityRuleRepository';

export class DataQualityRuleService {
  private static instance: DataQualityRuleService;
  private repo = DataQualityRuleRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataQualityRuleService {
    if (!DataQualityRuleService.instance) {
      DataQualityRuleService.instance = new DataQualityRuleService();
    }
    return DataQualityRuleService.instance;
  }

  public async create(data: DataQualityRule): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataQualityRule | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataQualityRule[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
