import { SearchQuery } from '../types';

export class SearchQueryRepository {
  async save(query: SearchQuery): Promise<SearchQuery> {
    throw new Error('Not implemented');
  }
}
