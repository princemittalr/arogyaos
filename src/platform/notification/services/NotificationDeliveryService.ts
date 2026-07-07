import { NotificationDelivery } from '../types';
import { NotificationDeliveryRepository } from '../repositories';

export class NotificationDeliveryService {
  constructor(private readonly deliveryRepo: NotificationDeliveryRepository) {}

  async manageDeliveryMetadata(delivery: Partial<NotificationDelivery>): Promise<NotificationDelivery> {
    throw new Error('Not implemented');
  }
}
