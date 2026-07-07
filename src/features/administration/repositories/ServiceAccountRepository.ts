import { ServiceAccount } from '../types';

export class ServiceAccountRepository {
  async save(account: ServiceAccount): Promise<ServiceAccount> {
    throw new Error('Not implemented');
  }

  async findByTenantId(tenantId: string): Promise<ServiceAccount[]> {
    throw new Error('Not implemented');
  }
}
