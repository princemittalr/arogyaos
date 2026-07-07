import { WorkflowInstance } from '../types';
import { WorkflowInstanceRepository } from '../repositories';
export class WorkflowInstanceService {
  constructor(private readonly repo: WorkflowInstanceRepository) {}
  async manageWorkflowInstance(item: Partial<WorkflowInstance>): Promise<WorkflowInstance> { throw new Error('Not implemented'); }
}
