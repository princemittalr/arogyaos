import { TopicSubscription } from '../types';

export class SubscriptionRepository {
  async save(subscription: TopicSubscription): Promise<TopicSubscription> {
    throw new Error('Not implemented');
  }
}
