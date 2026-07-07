import { ComplianceAssessment } from '../types';

export class ComplianceAssessmentRepository {
  async save(assessment: ComplianceAssessment): Promise<ComplianceAssessment> {
    throw new Error('Not implemented');
  }
}
