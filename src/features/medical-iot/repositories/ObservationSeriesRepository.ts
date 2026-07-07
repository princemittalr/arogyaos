import { ObservationSeries } from '../types';

export class ObservationSeriesRepository {
  async save(series: ObservationSeries): Promise<ObservationSeries> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<ObservationSeries | null> {
    throw new Error('Not implemented');
  }
}
