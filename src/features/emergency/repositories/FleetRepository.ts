import { FleetStatistics } from '../types';

export class FleetRepository {
  async getStatistics(): Promise<FleetStatistics> {
    throw new Error('Not implemented');
  }
}
