import { FHIRSubscription } from '../types';
import { FHIRSubscriptionRepository } from '../repositories';
export class FHIRSubscriptionService {
  constructor(private readonly repo: FHIRSubscriptionRepository) {}
  async manageFHIRSubscriptionMetadata(item: Partial<FHIRSubscription>): Promise<FHIRSubscription> { throw new Error('Not implemented'); }
}
