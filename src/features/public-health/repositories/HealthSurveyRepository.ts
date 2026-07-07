import { HealthSurvey } from '../types';

export class HealthSurveyRepository {
  async findById(id: string): Promise<HealthSurvey | null> {
    throw new Error('Not implemented');
  }

  async save(survey: HealthSurvey): Promise<HealthSurvey> {
    throw new Error('Not implemented');
  }
}
