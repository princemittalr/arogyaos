import { APIKey } from '../types';

export class APIKeyRepository {
  async save(key: APIKey): Promise<APIKey> {
    throw new Error('Not implemented');
  }

  async findByServiceAccountId(serviceAccountId: string): Promise<APIKey[]> {
    throw new Error('Not implemented');
  }
}
