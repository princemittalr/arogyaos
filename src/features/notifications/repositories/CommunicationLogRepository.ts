import { CommunicationLog } from '../types';

export class CommunicationLogRepository {
  async findById(id: string): Promise<CommunicationLog | null> {
    throw new Error('Not implemented');
  }

  async save(log: CommunicationLog): Promise<CommunicationLog> {
    throw new Error('Not implemented');
  }

  async findByRecipient(recipientId: string): Promise<CommunicationLog[]> {
    throw new Error('Not implemented');
  }

  async findByNotificationId(notificationId: string): Promise<CommunicationLog[]> {
    throw new Error('Not implemented');
  }
}
