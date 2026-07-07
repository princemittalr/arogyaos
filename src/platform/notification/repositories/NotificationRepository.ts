import { Notification } from '../types';

export class NotificationRepository {
  async save(notification: Notification): Promise<Notification> {
    throw new Error('Not implemented');
  }
}
