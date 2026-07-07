import { WorkflowHistory } from '../types';
import { WorkflowHistoryRepository } from '../repositories';
export class WorkflowHistoryService {
  constructor(private readonly repo: WorkflowHistoryRepository) {}
  async manageWorkflowHistory(item: Partial<WorkflowHistory>): Promise<WorkflowHistory> { throw new Error('Not implemented'); }
}
