import { NotificationAuditEntry } from '../types';

export class NotificationAuditRepository {
  async save(entry: NotificationAuditEntry): Promise<NotificationAuditEntry> {
    throw new Error('Not implemented');
  }
}
