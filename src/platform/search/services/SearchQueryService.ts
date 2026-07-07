import { SearchQuery } from '../types';
import { SearchQueryRepository } from '../repositories';

export class SearchQueryService {
  constructor(private readonly queryRepo: SearchQueryRepository) {}

  async manageQueryMetadata(query: Partial<SearchQuery>): Promise<SearchQuery> {
    throw new Error('Not implemented');
  }
}
