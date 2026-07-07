import { DashboardWidget } from '../types';

export class DashboardWidgetRepository {
  async save(widget: DashboardWidget): Promise<DashboardWidget> {
    throw new Error('Not implemented');
  }
}
