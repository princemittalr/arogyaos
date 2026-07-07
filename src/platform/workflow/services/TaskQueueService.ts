import { TaskQueue } from '../types';
import { TaskQueueRepository } from '../repositories';
export class TaskQueueService {
  constructor(private readonly repo: TaskQueueRepository) {}
  async manageTaskQueue(item: Partial<TaskQueue>): Promise<TaskQueue> { throw new Error('Not implemented'); }
}
