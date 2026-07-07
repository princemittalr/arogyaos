import { Risk } from '../types';

export class RiskRepository {
  async save(risk: Risk): Promise<Risk> {
    throw new Error('Not implemented');
  }
}
