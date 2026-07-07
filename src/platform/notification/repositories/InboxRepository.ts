import { InboxMessage } from '../types';

export class InboxRepository {
  async save(message: InboxMessage): Promise<InboxMessage> {
    throw new Error('Not implemented');
  }
}
