import { ModuleConfiguration } from '../types';

export class ModuleConfigurationRepository {
  async save(config: ModuleConfiguration): Promise<ModuleConfiguration> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<ModuleConfiguration[]> {
    throw new Error('Not implemented');
  }
}
