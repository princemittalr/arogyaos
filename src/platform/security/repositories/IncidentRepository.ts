import { Incident } from '../types';

export class IncidentRepository {
  async save(incident: Incident): Promise<Incident> {
    throw new Error('Not implemented');
  }
}
