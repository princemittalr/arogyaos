import { Report } from '../types';

export class ReportRepository {
  async save(report: Report): Promise<Report> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Report | null> {
    throw new Error('Not implemented');
  }
}
