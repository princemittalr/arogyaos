import { ExchangeTransaction } from '../types';
import { ExchangeTransactionRepository } from '../repositories';
export class ExchangeTransactionService {
  constructor(private readonly repo: ExchangeTransactionRepository) {}
  async manageExchangeTransactionMetadata(item: Partial<ExchangeTransaction>): Promise<ExchangeTransaction> { throw new Error('Not implemented'); }
}
