import { NavigationCategory } from '../types';
import { NavigationRepository } from '../repositories';

export class NavigationService {
  constructor(private readonly navRepo: NavigationRepository) {}

  async manageNavigationMetadata(category: Partial<NavigationCategory>): Promise<NavigationCategory> {
    throw new Error('Not implemented');
  }
}
