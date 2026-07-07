import { Notification } from '../types';
import { NotificationRepository } from '../repositories';

export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    throw new Error('Not implemented');
  }

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification> {
    throw new Error('Not implemented');
  }

  async queueNotification(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async cancelNotification(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async markAsSent(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async markAsDelivered(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async markAsRead(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getNotificationHistory(recipientId: string): Promise<Notification[]> {
    throw new Error('Not implemented');
  }
}
