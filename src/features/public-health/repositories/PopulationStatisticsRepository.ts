import { DistrictStatistics, StateStatistics, NationalStatistics } from '../types';

export class PopulationStatisticsRepository {
  async getDistrictStats(districtId: string): Promise<DistrictStatistics | null> {
    throw new Error('Not implemented');
  }

  async getStateStats(stateId: string): Promise<StateStatistics | null> {
    throw new Error('Not implemented');
  }

  async getNationalStats(countryId: string): Promise<NationalStatistics | null> {
    throw new Error('Not implemented');
  }
}
