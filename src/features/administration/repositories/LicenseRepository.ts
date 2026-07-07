import { License } from '../types';

export class LicenseRepository {
  async save(license: License): Promise<License> {
    throw new Error('Not implemented');
  }

  async findByTenantId(tenantId: string): Promise<License | null> {
    throw new Error('Not implemented');
  }
}
