import { EventSubscription } from '../types';

export class EventSubscriptionRepository {
  async save(subscription: EventSubscription): Promise<EventSubscription> {
    throw new Error('Not implemented');
  }
}
