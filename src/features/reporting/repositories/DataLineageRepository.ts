import { DataLineage } from '../types';

export class DataLineageRepository {
  async save(lineage: DataLineage): Promise<DataLineage> {
    throw new Error('Not implemented');
  }
}
