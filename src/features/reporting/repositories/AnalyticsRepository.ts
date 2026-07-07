import { AnalyticsQuery, AnalyticsResult } from '../types';

export class AnalyticsRepository {
  async saveQuery(query: AnalyticsQuery): Promise<AnalyticsQuery> {
    throw new Error('Not implemented');
  }

  async saveResult(result: AnalyticsResult): Promise<AnalyticsResult> {
    throw new Error('Not implemented');
  }
}
