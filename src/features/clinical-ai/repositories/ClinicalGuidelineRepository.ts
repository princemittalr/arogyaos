import { ClinicalGuideline } from '../types';

export class ClinicalGuidelineRepository {
  async findById(id: string): Promise<ClinicalGuideline | null> {
    throw new Error('Not implemented');
  }

  async findByVersion(version: string): Promise<ClinicalGuideline[]> {
    throw new Error('Not implemented');
  }

  async save(guideline: ClinicalGuideline): Promise<ClinicalGuideline> {
    throw new Error('Not implemented');
  }
}
