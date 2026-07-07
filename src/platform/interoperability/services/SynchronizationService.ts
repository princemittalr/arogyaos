import { SynchronizationProfile } from '../types';
import { SynchronizationRepository } from '../repositories';
export class SynchronizationService {
  constructor(private readonly repo: SynchronizationRepository) {}
  async manageSynchronizationMetadata(item: Partial<SynchronizationProfile>): Promise<SynchronizationProfile> { throw new Error('Not implemented'); }
}
