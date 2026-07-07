import { WorkflowArchive } from '../types';
import { WorkflowArchiveRepository } from '../repositories';
export class WorkflowArchiveService {
  constructor(private readonly repo: WorkflowArchiveRepository) {}
  async manageWorkflowArchive(item: Partial<WorkflowArchive>): Promise<WorkflowArchive> { throw new Error('Not implemented'); }
}
