import { ModuleRegistry } from '../types';

export class ModuleRegistryRepository {
  async save(registry: ModuleRegistry): Promise<ModuleRegistry> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<ModuleRegistry | null> {
    throw new Error('Not implemented');
  }
}
