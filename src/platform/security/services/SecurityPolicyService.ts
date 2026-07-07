import { SecurityPolicy } from '../types';
import { SecurityPolicyRepository } from '../repositories';

export class SecurityPolicyService {
  constructor(private readonly policyRepo: SecurityPolicyRepository) {}

  async manageSecurityPolicyMetadata(policy: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    throw new Error('Not implemented');
  }
}
