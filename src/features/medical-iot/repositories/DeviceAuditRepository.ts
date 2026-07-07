import { DeviceAudit } from '../types';

export class DeviceAuditRepository {
  async save(audit: DeviceAudit): Promise<DeviceAudit> {
    throw new Error('Not implemented');
  }

  async findByDeviceId(deviceId: string): Promise<DeviceAudit[]> {
    throw new Error('Not implemented');
  }
}
