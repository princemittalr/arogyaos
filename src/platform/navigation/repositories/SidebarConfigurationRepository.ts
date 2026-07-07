import { SidebarConfiguration } from '../types';

export class SidebarConfigurationRepository {
  async save(config: SidebarConfiguration): Promise<SidebarConfiguration> {
    throw new Error('Not implemented');
  }
}
