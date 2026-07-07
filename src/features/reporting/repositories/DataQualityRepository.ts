import { DataQuality } from '../types';

export class DataQualityRepository {
  async save(quality: DataQuality): Promise<DataQuality> {
    throw new Error('Not implemented');
  }
}
