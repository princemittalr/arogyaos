import { NavigationCategory } from '../types';

export class NavigationRepository {
  async save(category: NavigationCategory): Promise<NavigationCategory> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<NavigationCategory | null> {
    throw new Error('Not implemented');
  }
}
