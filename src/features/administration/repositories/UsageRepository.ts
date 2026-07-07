import { UsageMetric } from '../types';

export class UsageRepository {
  async saveMetric(metric: UsageMetric): Promise<void> {
    throw new Error('Not implemented');
  }

  async getMetricsByTenant(tenantId: string): Promise<UsageMetric[]> {
    throw new Error('Not implemented');
  }
}
