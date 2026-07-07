import { WorkflowExport } from '../types';
import { WorkflowExportRepository } from '../repositories';
export class WorkflowExportService {
  constructor(private readonly repo: WorkflowExportRepository) {}
  async manageWorkflowExport(item: Partial<WorkflowExport>): Promise<WorkflowExport> { throw new Error('Not implemented'); }
}
