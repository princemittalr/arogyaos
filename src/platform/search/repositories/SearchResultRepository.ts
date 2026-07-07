import { SearchResult } from '../types';

export class SearchResultRepository {
  async save(result: SearchResult): Promise<SearchResult> {
    throw new Error('Not implemented');
  }
}
