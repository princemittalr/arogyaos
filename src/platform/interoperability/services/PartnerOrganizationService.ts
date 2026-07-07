import { PartnerOrganization } from '../types';
import { PartnerOrganizationRepository } from '../repositories';
export class PartnerOrganizationService {
  constructor(private readonly repo: PartnerOrganizationRepository) {}
  async managePartnerMetadata(item: Partial<PartnerOrganization>): Promise<PartnerOrganization> { throw new Error('Not implemented'); }
}
