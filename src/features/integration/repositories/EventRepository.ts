import { Event } from '../types';

export class EventRepository {
  async save(event: Event): Promise<Event> {
    throw new Error('Not implemented');
  }

  async findByTopicId(topicId: string): Promise<Event[]> {
    throw new Error('Not implemented');
  }
}
