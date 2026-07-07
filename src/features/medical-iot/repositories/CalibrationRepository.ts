import { DeviceCalibration } from '../types';

export class CalibrationRepository {
  async save(calibration: DeviceCalibration): Promise<DeviceCalibration> {
    throw new Error('Not implemented');
  }

  async findByDeviceId(deviceId: string): Promise<DeviceCalibration | null> {
    throw new Error('Not implemented');
  }
}
