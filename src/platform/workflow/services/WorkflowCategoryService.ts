import { WorkflowCategory } from '../types';
import { WorkflowCategoryRepository } from '../repositories';
export class WorkflowCategoryService {
  constructor(private readonly repo: WorkflowCategoryRepository) {}
  async manageWorkflowCategory(item: Partial<WorkflowCategory>): Promise<WorkflowCategory> { throw new Error('Not implemented'); }
}
