import { WorkflowDefinition } from '../types';
import { WorkflowDefinitionRepository } from '../repositories';
export class WorkflowDefinitionService {
  constructor(private readonly repo: WorkflowDefinitionRepository) {}
  async manageWorkflowDefinition(item: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> { throw new Error('Not implemented'); }
}
