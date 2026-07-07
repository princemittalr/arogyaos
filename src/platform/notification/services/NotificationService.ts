import { Notification } from '../types';
import { NotificationRepository } from '../repositories';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async manageNotificationMetadata(notification: Partial<Notification>): Promise<Notification> {
    throw new Error('Not implemented');
  }
}
