import { DataExchangePolicy } from '../types';
import { DataExchangePolicyRepository } from '../repositories';
export class DataExchangePolicyService {
  constructor(private readonly repo: DataExchangePolicyRepository) {}
  async manageExchangePolicyMetadata(item: Partial<DataExchangePolicy>): Promise<DataExchangePolicy> { throw new Error('Not implemented'); }
}
