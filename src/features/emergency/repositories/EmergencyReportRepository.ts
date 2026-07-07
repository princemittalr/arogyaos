import { EmergencyReport } from '../types';

export class EmergencyReportRepository {
  async findByCaseId(caseId: string): Promise<EmergencyReport | null> {
    throw new Error('Not implemented');
  }

  async save(report: EmergencyReport): Promise<EmergencyReport> {
    throw new Error('Not implemented');
  }
}
