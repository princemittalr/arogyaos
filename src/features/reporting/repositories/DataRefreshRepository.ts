import { DataRefresh } from '../types';

export class DataRefreshRepository {
  async save(refresh: DataRefresh): Promise<DataRefresh> {
    throw new Error('Not implemented');
  }
}
