import { SearchProvider } from '../types';

export class SearchProviderRepository {
  async save(provider: SearchProvider): Promise<SearchProvider> {
    throw new Error('Not implemented');
  }
}
