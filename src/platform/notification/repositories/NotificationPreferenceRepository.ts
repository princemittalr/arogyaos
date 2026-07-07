import { NotificationPreference } from '../types';

export class NotificationPreferenceRepository {
  async save(preference: NotificationPreference): Promise<NotificationPreference> {
    throw new Error('Not implemented');
  }
}
