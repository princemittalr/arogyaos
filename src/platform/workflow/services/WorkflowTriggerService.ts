import { WorkflowTrigger } from '../types';
import { WorkflowTriggerRepository } from '../repositories';
export class WorkflowTriggerService {
  constructor(private readonly repo: WorkflowTriggerRepository) {}
  async manageWorkflowTrigger(item: Partial<WorkflowTrigger>): Promise<WorkflowTrigger> { throw new Error('Not implemented'); }
}
