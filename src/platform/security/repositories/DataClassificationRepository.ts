import { DataClassification } from '../types';

export class DataClassificationRepository {
  async save(classification: DataClassification): Promise<DataClassification> {
    throw new Error('Not implemented');
  }
}
