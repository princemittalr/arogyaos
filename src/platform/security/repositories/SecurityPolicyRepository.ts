import { SecurityPolicy } from '../types';

export class SecurityPolicyRepository {
  async save(policy: SecurityPolicy): Promise<SecurityPolicy> {
    throw new Error('Not implemented');
  }
}
