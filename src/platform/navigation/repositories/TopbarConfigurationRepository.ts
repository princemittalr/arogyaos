import { TopbarConfiguration } from '../types';

export class TopbarConfigurationRepository {
  async save(config: TopbarConfiguration): Promise<TopbarConfiguration> {
    throw new Error('Not implemented');
  }
}
