import { CommunicationPolicy } from '../types';
import { CommunicationPolicyRepository } from '../repositories';

export class CommunicationPolicyService {
  constructor(private readonly policyRepo: CommunicationPolicyRepository) {}

  async managePolicyMetadata(policy: Partial<CommunicationPolicy>): Promise<CommunicationPolicy> {
    throw new Error('Not implemented');
  }
}
