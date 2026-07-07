import { NotificationPreference } from '../types';

export class PreferenceRepository {
  async findByUserId(userId: string): Promise<NotificationPreference | null> {
    throw new Error('Not implemented');
  }

  async save(preference: NotificationPreference): Promise<NotificationPreference> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
