import { WorkflowGovernance } from '../types';
import { WorkflowGovernanceRepository } from '../repositories';
export class WorkflowGovernanceService {
  constructor(private readonly repo: WorkflowGovernanceRepository) {}
  async manageWorkflowGovernance(item: Partial<WorkflowGovernance>): Promise<WorkflowGovernance> { throw new Error('Not implemented'); }
}
