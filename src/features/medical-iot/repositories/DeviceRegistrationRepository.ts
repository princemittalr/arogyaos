import { DeviceRegistration } from '../types';

export class DeviceRegistrationRepository {
  async save(registration: DeviceRegistration): Promise<DeviceRegistration> {
    throw new Error('Not implemented');
  }

  async findByDeviceId(deviceId: string): Promise<DeviceRegistration | null> {
    throw new Error('Not implemented');
  }
}
