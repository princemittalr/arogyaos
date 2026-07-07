import { ModuleRegistry } from '../types';
import { ModuleRegistryRepository } from '../repositories';

export class ModuleRegistryService {
  constructor(private readonly moduleRepo: ModuleRegistryRepository) {}

  async maintainModuleMetadata(registry: Partial<ModuleRegistry>): Promise<ModuleRegistry> {
    throw new Error('Not implemented');
  }
}
