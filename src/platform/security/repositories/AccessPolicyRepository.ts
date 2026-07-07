import { AccessPolicy } from '../types';

export class AccessPolicyRepository {
  async save(policy: AccessPolicy): Promise<AccessPolicy> {
    throw new Error('Not implemented');
  }
}
