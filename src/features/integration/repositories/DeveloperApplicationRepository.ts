import { DeveloperApplication } from '../types';

export class DeveloperApplicationRepository {
  async save(application: DeveloperApplication): Promise<DeveloperApplication> {
    throw new Error('Not implemented');
  }

  async findByDeveloperId(developerId: string): Promise<DeveloperApplication[]> {
    throw new Error('Not implemented');
  }
}
