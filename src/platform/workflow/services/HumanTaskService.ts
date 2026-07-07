import { HumanTask } from '../types';
import { HumanTaskRepository } from '../repositories';
export class HumanTaskService {
  constructor(private readonly repo: HumanTaskRepository) {}
  async manageHumanTask(item: Partial<HumanTask>): Promise<HumanTask> { throw new Error('Not implemented'); }
}
