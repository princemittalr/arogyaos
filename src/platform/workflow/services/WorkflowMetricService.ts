import { WorkflowMetric } from '../types';
import { WorkflowMetricRepository } from '../repositories';
export class WorkflowMetricService {
  constructor(private readonly repo: WorkflowMetricRepository) {}
  async manageWorkflowMetric(item: Partial<WorkflowMetric>): Promise<WorkflowMetric> { throw new Error('Not implemented'); }
}
