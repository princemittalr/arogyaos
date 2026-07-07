import { Dashboard } from '../types';

export class DashboardRepository {
  async save(dashboard: Dashboard): Promise<Dashboard> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Dashboard | null> {
    throw new Error('Not implemented');
  }
}
