import { CrossModuleWorkflow } from '../types';
import { WorkflowRepository } from '../repositories';

export class WorkflowDefinitionService {
  constructor(private readonly workflowRepo: WorkflowRepository) {}

  async createWorkflowMetadata(workflow: Partial<CrossModuleWorkflow>): Promise<CrossModuleWorkflow> {
    throw new Error('Not implemented');
  }

  async updateWorkflowMetadata(workflow: Partial<CrossModuleWorkflow>): Promise<CrossModuleWorkflow> {
    throw new Error('Not implemented');
  }

  async archiveWorkflowMetadata(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
