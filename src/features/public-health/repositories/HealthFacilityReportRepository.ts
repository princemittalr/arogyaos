import { HealthFacilityReport } from '../types';

export class HealthFacilityReportRepository {
  async findById(id: string): Promise<HealthFacilityReport | null> {
    throw new Error('Not implemented');
  }

  async findByFacilityId(facilityId: string): Promise<HealthFacilityReport[]> {
    throw new Error('Not implemented');
  }

  async save(report: HealthFacilityReport): Promise<HealthFacilityReport> {
    throw new Error('Not implemented');
  }
}
