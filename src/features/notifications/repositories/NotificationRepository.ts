import { Notification, NotificationStatus } from '../types';

export class NotificationRepository {
  async findById(id: string): Promise<Notification | null> {
    throw new Error('Not implemented');
  }

  async save(notification: Notification): Promise<Notification> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: NotificationStatus): Promise<void> {
    throw new Error('Not implemented');
  }

  async findByRecipient(recipientId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    throw new Error('Not implemented');
  }
}
