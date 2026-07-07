import { WorkflowExecution } from '../types';

export class WorkflowExecutionRepository {
  async save(execution: WorkflowExecution): Promise<WorkflowExecution> {
    throw new Error('Not implemented');
  }
}
