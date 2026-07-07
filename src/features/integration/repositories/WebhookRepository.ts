import { Webhook } from '../types';

export class WebhookRepository {
  async save(webhook: Webhook): Promise<Webhook> {
    throw new Error('Not implemented');
  }

  async findByApplicationId(applicationId: string): Promise<Webhook[]> {
    throw new Error('Not implemented');
  }
}
