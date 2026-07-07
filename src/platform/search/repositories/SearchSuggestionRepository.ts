import { SearchSuggestion } from '../types';

export class SearchSuggestionRepository {
  async save(suggestion: SearchSuggestion): Promise<SearchSuggestion> {
    throw new Error('Not implemented');
  }
}
