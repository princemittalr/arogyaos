import { VaccinationCoverage, ReportingLevel } from '../types';

export class VaccinationCoverageRepository {
  async findByLocation(locationId: string, level: ReportingLevel): Promise<VaccinationCoverage[]> {
    throw new Error('Not implemented');
  }

  async save(coverage: VaccinationCoverage): Promise<VaccinationCoverage> {
    throw new Error('Not implemented');
  }
}
