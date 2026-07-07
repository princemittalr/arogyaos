import { EmergencyIncident } from '../types';

export class IncidentRepository {
  async findById(id: string): Promise<EmergencyIncident | null> {
    throw new Error('Not implemented');
  }

  async findActiveIncidents(): Promise<EmergencyIncident[]> {
    throw new Error('Not implemented');
  }

  async save(incident: EmergencyIncident): Promise<EmergencyIncident> {
    throw new Error('Not implemented');
  }
}
