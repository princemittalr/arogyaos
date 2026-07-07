import { Integration } from '../types';

export class IntegrationRepository {
  async save(integration: Integration): Promise<Integration> {
    throw new Error('Not implemented');
  }

  async findByTenantId(tenantId: string): Promise<Integration[]> {
    throw new Error('Not implemented');
  }
}
