import { DiseaseCase, CaseStatus } from '../types';

export class DiseaseCaseRepository {
  async findById(id: string): Promise<DiseaseCase | null> {
    throw new Error('Not implemented');
  }

  async findByDiseaseId(diseaseId: string): Promise<DiseaseCase[]> {
    throw new Error('Not implemented');
  }

  async save(diseaseCase: DiseaseCase): Promise<DiseaseCase> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: CaseStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
