import { FirmwareUpdate } from '../types';

export class FirmwareRepository {
  async save(update: FirmwareUpdate): Promise<FirmwareUpdate> {
    throw new Error('Not implemented');
  }

  async findByDeviceId(deviceId: string): Promise<FirmwareUpdate[]> {
    throw new Error('Not implemented');
  }
}
