import { Tenant } from '../types';

export class TenantRepository {
  async save(tenant: Tenant): Promise<Tenant> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Tenant | null> {
    throw new Error('Not implemented');
  }
}
