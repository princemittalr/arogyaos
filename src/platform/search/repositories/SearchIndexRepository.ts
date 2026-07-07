import { SearchIndex } from '../types';

export class SearchIndexRepository {
  async save(index: SearchIndex): Promise<SearchIndex> {
    throw new Error('Not implemented');
  }
}
