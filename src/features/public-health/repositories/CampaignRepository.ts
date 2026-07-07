import { PublicHealthCampaign, CampaignStatus } from '../types';

export class CampaignRepository {
  async findById(id: string): Promise<PublicHealthCampaign | null> {
    throw new Error('Not implemented');
  }

  async findByStatus(status: CampaignStatus): Promise<PublicHealthCampaign[]> {
    throw new Error('Not implemented');
  }

  async save(campaign: PublicHealthCampaign): Promise<PublicHealthCampaign> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: CampaignStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
