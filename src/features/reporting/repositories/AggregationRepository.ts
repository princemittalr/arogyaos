import { Aggregation } from '../types';

export class AggregationRepository {
  async save(aggregation: Aggregation): Promise<Aggregation> {
    throw new Error('Not implemented');
  }
}
