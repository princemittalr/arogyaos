import { IntegrationAudit } from '../types';

export class IntegrationAuditRepository {
  async save(audit: IntegrationAudit): Promise<IntegrationAudit> {
    throw new Error('Not implemented');
  }

  async findByIntegrationId(integrationId: string): Promise<IntegrationAudit[]> {
    throw new Error('Not implemented');
  }
}
