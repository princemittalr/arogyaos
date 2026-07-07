import { DeviceAssignment } from '../types';

export class DeviceAssignmentRepository {
  async save(assignment: DeviceAssignment): Promise<DeviceAssignment> {
    throw new Error('Not implemented');
  }

  async findByDeviceId(deviceId: string): Promise<DeviceAssignment[]> {
    throw new Error('Not implemented');
  }

  async findByPatientId(patientId: string): Promise<DeviceAssignment[]> {
    throw new Error('Not implemented');
  }
}
