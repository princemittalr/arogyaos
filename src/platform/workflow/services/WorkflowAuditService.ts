import { WorkflowAudit } from '../types';
import { WorkflowAuditRepository } from '../repositories';
export class WorkflowAuditService {
  constructor(private readonly repo: WorkflowAuditRepository) {}
  async manageWorkflowAudit(item: Partial<WorkflowAudit>): Promise<WorkflowAudit> { throw new Error('Not implemented'); }
}
