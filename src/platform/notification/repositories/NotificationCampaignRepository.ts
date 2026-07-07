import { NotificationCampaign } from '../types';

export class NotificationCampaignRepository {
  async save(campaign: NotificationCampaign): Promise<NotificationCampaign> {
    throw new Error('Not implemented');
  }
}
