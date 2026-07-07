import { CommunicationPolicy } from '../types';

export class CommunicationPolicyRepository {
  async save(policy: CommunicationPolicy): Promise<CommunicationPolicy> {
    throw new Error('Not implemented');
  }
}
