import { KPI, KPIDefinition } from '../types';

export class KPIRepository {
  async save(kpi: KPI): Promise<KPI> {
    throw new Error('Not implemented');
  }

  async saveDefinition(def: KPIDefinition): Promise<KPIDefinition> {
    throw new Error('Not implemented');
  }
}
