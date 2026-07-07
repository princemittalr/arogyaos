import { ProviderRegistry } from '../types';
import { ProviderRegistryRepository } from '../repositories';
export class ProviderRegistryService {
  constructor(private readonly repo: ProviderRegistryRepository) {}
  async manageProviderRegistryMetadata(item: Partial<ProviderRegistry>): Promise<ProviderRegistry> { throw new Error('Not implemented'); }
}
