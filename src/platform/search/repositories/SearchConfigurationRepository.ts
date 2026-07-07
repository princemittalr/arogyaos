import { SearchConfiguration } from '../types';

export class SearchConfigurationRepository {
  async save(config: SearchConfiguration): Promise<SearchConfiguration> {
    throw new Error('Not implemented');
  }
}
