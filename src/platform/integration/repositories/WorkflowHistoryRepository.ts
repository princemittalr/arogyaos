import { WorkflowHistory } from '../types';

export class WorkflowHistoryRepository {
  async save(history: WorkflowHistory): Promise<WorkflowHistory> {
    throw new Error('Not implemented');
  }
}
