import { WorkflowValidation } from '../types';
import { WorkflowValidationRepository } from '../repositories';
export class WorkflowValidationService {
  constructor(private readonly repo: WorkflowValidationRepository) {}
  async manageWorkflowValidation(item: Partial<WorkflowValidation>): Promise<WorkflowValidation> { throw new Error('Not implemented'); }
}
