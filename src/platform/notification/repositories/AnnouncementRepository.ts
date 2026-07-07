import { Announcement } from '../types';

export class AnnouncementRepository {
  async save(announcement: Announcement): Promise<Announcement> {
    throw new Error('Not implemented');
  }
}
