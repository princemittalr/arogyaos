import { Benchmark } from '../types';

export class BenchmarkRepository {
  async save(benchmark: Benchmark): Promise<Benchmark> {
    throw new Error('Not implemented');
  }
}
