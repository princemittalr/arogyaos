import { SystemConfiguration } from '../types';

export class SystemConfigurationRepository {
  async save(config: SystemConfiguration): Promise<SystemConfiguration> {
    throw new Error('Not implemented');
  }

  async findByTenantId(tenantId: string): Promise<SystemConfiguration | null> {
    throw new Error('Not implemented');
  }
}
