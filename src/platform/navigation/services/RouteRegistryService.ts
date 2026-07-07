import { RouteRegistry } from '../types';
import { RouteRegistryRepository } from '../repositories';

export class RouteRegistryService {
  constructor(private readonly registryRepo: RouteRegistryRepository) {}

  async registerRouteMetadata(registry: Partial<RouteRegistry>): Promise<RouteRegistry> {
    throw new Error('Not implemented');
  }

  async validateRouteMetadata(registryId: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
