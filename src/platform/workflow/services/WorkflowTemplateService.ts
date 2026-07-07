import { WorkflowTemplate } from '../types';
import { WorkflowTemplateRepository } from '../repositories';
export class WorkflowTemplateService {
  constructor(private readonly repo: WorkflowTemplateRepository) {}
  async manageWorkflowTemplate(item: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> { throw new Error('Not implemented'); }
}
