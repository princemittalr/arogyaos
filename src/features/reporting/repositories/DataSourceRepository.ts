import { DataSource } from '../types';

export class DataSourceRepository {
  async save(source: DataSource): Promise<DataSource> {
    throw new Error('Not implemented');
  }
}
