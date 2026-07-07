import { Organization } from '../types';

export class OrganizationRepository {
  async save(org: Organization): Promise<Organization> {
    throw new Error('Not implemented');
  }

  async findByTenantId(tenantId: string): Promise<Organization[]> {
    throw new Error('Not implemented');
  }
}
