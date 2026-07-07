import { WorkflowVersion } from '../types';
import { WorkflowVersionRepository } from '../repositories';
export class WorkflowVersionService {
  constructor(private readonly repo: WorkflowVersionRepository) {}
  async manageWorkflowVersion(item: Partial<WorkflowVersion>): Promise<WorkflowVersion> { throw new Error('Not implemented'); }
}
