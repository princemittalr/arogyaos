import { SDK } from '../types';

export class SDKRepository {
  async save(sdk: SDK): Promise<SDK> {
    throw new Error('Not implemented');
  }

  async findByApiId(apiId: string): Promise<SDK[]> {
    throw new Error('Not implemented');
  }
}
