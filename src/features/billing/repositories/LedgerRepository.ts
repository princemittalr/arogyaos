import { LedgerEntry } from '../types';

export class LedgerRepository {
  async findById(id: string): Promise<LedgerEntry | null> {
    throw new Error('Not implemented');
  }

  async save(entry: LedgerEntry): Promise<LedgerEntry> {
    throw new Error('Not implemented');
  }

  async findByAccountId(accountId: string): Promise<LedgerEntry[]> {
    throw new Error('Not implemented');
  }
}
