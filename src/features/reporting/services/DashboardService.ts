import { Dashboard } from '../types';
import { DashboardRepository } from '../repositories';

export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  async trackDashboardMetadata(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    throw new Error('Not implemented');
  }
}
