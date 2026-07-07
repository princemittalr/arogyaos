import { SynchronizationJob } from '../types';

export class SynchronizationRepository {
  async save(job: SynchronizationJob): Promise<SynchronizationJob> {
    throw new Error('Not implemented');
  }

  async findByIntegrationId(integrationId: string): Promise<SynchronizationJob[]> {
    throw new Error('Not implemented');
  }
}
