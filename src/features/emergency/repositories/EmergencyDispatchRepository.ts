import { EmergencyDispatch, DispatchAssignment } from '../types';

export class EmergencyDispatchRepository {
  async findById(id: string): Promise<EmergencyDispatch | null> {
    throw new Error('Not implemented');
  }

  async save(dispatch: EmergencyDispatch): Promise<EmergencyDispatch> {
    throw new Error('Not implemented');
  }

  async saveAssignment(assignment: DispatchAssignment): Promise<DispatchAssignment> {
    throw new Error('Not implemented');
  }
}
