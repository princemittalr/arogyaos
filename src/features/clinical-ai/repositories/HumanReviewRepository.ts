import { HumanReview, ReviewStatus } from '../types';

export class HumanReviewRepository {
  async findById(id: string): Promise<HumanReview | null> {
    throw new Error('Not implemented');
  }

  async findByDecisionId(decisionId: string): Promise<HumanReview[]> {
    throw new Error('Not implemented');
  }

  async save(review: HumanReview): Promise<HumanReview> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: ReviewStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
