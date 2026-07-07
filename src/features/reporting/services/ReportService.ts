import { Report, ReportExecution } from '../types';
import { ReportRepository } from '../repositories';

export class ReportService {
  constructor(private readonly reportRepo: ReportRepository) {}

  async trackReportMetadata(report: Partial<Report>): Promise<Report> {
    throw new Error('Not implemented');
  }

  async trackExecutionMetadata(execution: Partial<ReportExecution>): Promise<ReportExecution> {
    throw new Error('Not implemented');
  }
}
