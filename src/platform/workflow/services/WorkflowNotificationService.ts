import { WorkflowNotification } from '../types';
import { WorkflowNotificationRepository } from '../repositories';
export class WorkflowNotificationService {
  constructor(private readonly repo: WorkflowNotificationRepository) {}
  async manageWorkflowNotification(item: Partial<WorkflowNotification>): Promise<WorkflowNotification> { throw new Error('Not implemented'); }
}
