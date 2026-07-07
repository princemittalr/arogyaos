import { CrossModuleWorkflow } from '../types';

export class WorkflowRepository {
  async save(workflow: CrossModuleWorkflow): Promise<CrossModuleWorkflow> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<CrossModuleWorkflow | null> {
    throw new Error('Not implemented');
  }
}
