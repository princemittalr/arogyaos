import { DiseaseInvestigation } from '../types';

export class InvestigationRepository {
  async findById(id: string): Promise<DiseaseInvestigation | null> {
    throw new Error('Not implemented');
  }

  async findByCaseId(caseId: string): Promise<DiseaseInvestigation[]> {
    throw new Error('Not implemented');
  }

  async save(investigation: DiseaseInvestigation): Promise<DiseaseInvestigation> {
    throw new Error('Not implemented');
  }
}
