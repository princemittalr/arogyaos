import { DispatchAssignment, EmergencyDispatch } from '../types';
import { EmergencyDispatchRepository } from '../repositories';

export class DispatchService {
  constructor(private readonly dispatchRepository: EmergencyDispatchRepository) {}

  async assignAmbulance(incidentId: string, ambulanceId: string, crewId: string): Promise<DispatchAssignment> {
    throw new Error('Not implemented');
  }

  async reassignDispatch(assignmentId: string, newAmbulanceId: string, newCrewId: string): Promise<DispatchAssignment> {
    throw new Error('Not implemented');
  }

  async cancelDispatch(assignmentId: string, reason: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getDispatchHistory(incidentId: string): Promise<EmergencyDispatch[]> {
    throw new Error('Not implemented');
  }
}
