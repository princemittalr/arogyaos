import { PrivacyPolicy } from '../types';

export class PrivacyPolicyRepository {
  async save(policy: PrivacyPolicy): Promise<PrivacyPolicy> {
    throw new Error('Not implemented');
  }
}
