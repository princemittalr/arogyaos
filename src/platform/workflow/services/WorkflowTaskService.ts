import { WorkflowTask } from '../types';
import { WorkflowTaskRepository } from '../repositories';
export class WorkflowTaskService {
  constructor(private readonly repo: WorkflowTaskRepository) {}
  async manageWorkflowTask(item: Partial<WorkflowTask>): Promise<WorkflowTask> { throw new Error('Not implemented'); }
}
