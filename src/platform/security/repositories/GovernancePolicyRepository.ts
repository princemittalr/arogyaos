import { GovernancePolicy } from '../types';

export class GovernancePolicyRepository {
  async save(policy: GovernancePolicy): Promise<GovernancePolicy> {
    throw new Error('Not implemented');
  }
}
