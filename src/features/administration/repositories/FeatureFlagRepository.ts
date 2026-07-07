import { FeatureFlag } from '../types';

export class FeatureFlagRepository {
  async save(flag: FeatureFlag): Promise<FeatureFlag> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<FeatureFlag[]> {
    throw new Error('Not implemented');
  }
}
