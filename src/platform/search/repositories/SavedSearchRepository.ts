import { SavedSearch } from '../types';

export class SavedSearchRepository {
  async save(savedSearch: SavedSearch): Promise<SavedSearch> {
    throw new Error('Not implemented');
  }
}
