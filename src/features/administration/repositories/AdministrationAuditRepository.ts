import { AdministrationAudit } from '../types';

export class AdministrationAuditRepository {
  async save(audit: AdministrationAudit): Promise<AdministrationAudit> {
    throw new Error('Not implemented');
  }

  async findByTargetId(targetId: string): Promise<AdministrationAudit[]> {
    throw new Error('Not implemented');
  }
}
