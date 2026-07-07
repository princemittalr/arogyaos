import { CrossModuleWorkflow } from '../types';

export class WorkflowRegistryService {
  async registerWorkflowMetadata(workflow: Partial<CrossModuleWorkflow>): Promise<CrossModuleWorkflow> {
    throw new Error('Not implemented');
  }
}
