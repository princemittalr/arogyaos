import { ClinicalRecommendation } from '../types';

export class ClinicalRecommendationRepository {
  async findById(id: string): Promise<ClinicalRecommendation | null> {
    throw new Error('Not implemented');
  }

  async save(recommendation: ClinicalRecommendation): Promise<ClinicalRecommendation> {
    throw new Error('Not implemented');
  }
}
