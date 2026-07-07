import { EncryptionPolicy } from '../types';

export class EncryptionPolicyRepository {
  async save(policy: EncryptionPolicy): Promise<EncryptionPolicy> {
    throw new Error('Not implemented');
  }
}
