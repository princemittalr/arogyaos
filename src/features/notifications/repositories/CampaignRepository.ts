import { Campaign } from '../types';

export class CampaignRepository {
  async findById(id: string): Promise<Campaign | null> {
    throw new Error('Not implemented');
  }

  async save(campaign: Campaign): Promise<Campaign> {
    throw new Error('Not implemented');
  }

  async findActiveCampaigns(): Promise<Campaign[]> {
    throw new Error('Not implemented');
  }
}
