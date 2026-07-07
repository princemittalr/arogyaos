import { APIVersion } from '../types';

export class APIVersionRepository {
  async save(version: APIVersion): Promise<APIVersion> {
    throw new Error('Not implemented');
  }

  async findByApiId(apiId: string): Promise<APIVersion[]> {
    throw new Error('Not implemented');
  }
}
