import { SearchAuditEntry } from '../types';

export class SearchAuditRepository {
  async save(entry: SearchAuditEntry): Promise<SearchAuditEntry> {
    throw new Error('Not implemented');
  }
}
