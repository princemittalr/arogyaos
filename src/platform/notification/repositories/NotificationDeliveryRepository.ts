import { NotificationDelivery } from '../types';

export class NotificationDeliveryRepository {
  async save(delivery: NotificationDelivery): Promise<NotificationDelivery> {
    throw new Error('Not implemented');
  }
}
