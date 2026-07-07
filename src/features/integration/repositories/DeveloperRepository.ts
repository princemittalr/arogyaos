import { Developer } from '../types';

export class DeveloperRepository {
  async save(developer: Developer): Promise<Developer> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Developer | null> {
    throw new Error('Not implemented');
  }
}
