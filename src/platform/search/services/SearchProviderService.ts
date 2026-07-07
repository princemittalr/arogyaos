import { SearchProvider } from '../types';
import { SearchProviderRepository } from '../repositories';

export class SearchProviderService {
  constructor(private readonly providerRepo: SearchProviderRepository) {}

  async manageProviderMetadata(provider: Partial<SearchProvider>): Promise<SearchProvider> {
    throw new Error('Not implemented');
  }
}
