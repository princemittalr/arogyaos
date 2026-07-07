import { TransformationRule } from '../types';
import { TransformationRuleRepository } from '../repositories/TransformationRuleRepository';

export class TransformationRuleService {
  private static instance: TransformationRuleService;
  private repo = TransformationRuleRepository.getInstance();

  private constructor() {}

  public static getInstance(): TransformationRuleService {
    if (!TransformationRuleService.instance) {
      TransformationRuleService.instance = new TransformationRuleService();
    }
    return TransformationRuleService.instance;
  }

  public async create(data: TransformationRule): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<TransformationRule | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<TransformationRule[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
