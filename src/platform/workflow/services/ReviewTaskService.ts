import { ReviewTask } from '../types';
import { ReviewTaskRepository } from '../repositories';
export class ReviewTaskService {
  constructor(private readonly repo: ReviewTaskRepository) {}
  async manageReviewTask(item: Partial<ReviewTask>): Promise<ReviewTask> { throw new Error('Not implemented'); }
}
