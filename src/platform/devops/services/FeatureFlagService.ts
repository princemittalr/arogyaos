import { FeatureFlag } from '../types';
import { FeatureFlagRepository } from '../repositories/FeatureFlagRepository';

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private repo = FeatureFlagRepository.getInstance();

  private constructor() {}

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  public async create(data: FeatureFlag): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<FeatureFlag | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<FeatureFlag[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
