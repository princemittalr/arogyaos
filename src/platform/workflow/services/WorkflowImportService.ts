import { WorkflowImport } from '../types';
import { WorkflowImportRepository } from '../repositories';
export class WorkflowImportService {
  constructor(private readonly repo: WorkflowImportRepository) {}
  async manageWorkflowImport(item: Partial<WorkflowImport>): Promise<WorkflowImport> { throw new Error('Not implemented'); }
}
