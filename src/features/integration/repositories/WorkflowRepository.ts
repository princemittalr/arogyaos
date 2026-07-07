import { Workflow } from '../types';

export class WorkflowRepository {
  async save(workflow: Workflow): Promise<Workflow> {
    throw new Error('Not implemented');
  }

  async findByTenantId(tenantId: string): Promise<Workflow[]> {
    throw new Error('Not implemented');
  }
}
