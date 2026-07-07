import { WorkflowExecution } from '../types';
import { WorkflowExecutionRepository } from '../repositories';
export class WorkflowExecutionMetadataService {
  constructor(private readonly repo: WorkflowExecutionRepository) {}
  async manageWorkflowExecution(item: Partial<WorkflowExecution>): Promise<WorkflowExecution> { throw new Error('Not implemented'); }
}
