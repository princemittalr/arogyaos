import { SearchConfiguration } from '../types';
import { SearchConfigurationRepository } from '../repositories';

export class SearchConfigurationService {
  constructor(private readonly configRepo: SearchConfigurationRepository) {}

  async manageConfigurationMetadata(config: Partial<SearchConfiguration>): Promise<SearchConfiguration> {
    throw new Error('Not implemented');
  }
}
