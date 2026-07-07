import { ApprovalTask } from '../types';
import { ApprovalTaskRepository } from '../repositories';
export class ApprovalTaskService {
  constructor(private readonly repo: ApprovalTaskRepository) {}
  async manageApprovalTask(item: Partial<ApprovalTask>): Promise<ApprovalTask> { throw new Error('Not implemented'); }
}
