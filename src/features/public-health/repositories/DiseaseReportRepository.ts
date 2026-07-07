import { DiseaseReport } from '../types';

export class DiseaseReportRepository {
  async findById(id: string): Promise<DiseaseReport | null> {
    throw new Error('Not implemented');
  }

  async findByFacility(facilityId: string): Promise<DiseaseReport[]> {
    throw new Error('Not implemented');
  }

  async save(report: DiseaseReport): Promise<DiseaseReport> {
    throw new Error('Not implemented');
  }
}
