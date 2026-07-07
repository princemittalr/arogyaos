import { Metric, MetricDefinition } from '../types';

export class MetricRepository {
  async save(metric: Metric): Promise<Metric> {
    throw new Error('Not implemented');
  }

  async saveDefinition(def: MetricDefinition): Promise<MetricDefinition> {
    throw new Error('Not implemented');
  }
}
