import { PrivacyPolicy } from '../types';
import { PrivacyPolicyRepository } from '../repositories';

export class PrivacyPolicyService {
  constructor(private readonly privacyRepo: PrivacyPolicyRepository) {}

  async managePrivacyPolicyMetadata(policy: Partial<PrivacyPolicy>): Promise<PrivacyPolicy> {
    throw new Error('Not implemented');
  }
}
