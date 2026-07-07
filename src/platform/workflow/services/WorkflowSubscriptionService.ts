import { WorkflowSubscription } from '../types';
import { WorkflowSubscriptionRepository } from '../repositories';
export class WorkflowSubscriptionService {
  constructor(private readonly repo: WorkflowSubscriptionRepository) {}
  async manageWorkflowSubscription(item: Partial<WorkflowSubscription>): Promise<WorkflowSubscription> { throw new Error('Not implemented'); }
}
