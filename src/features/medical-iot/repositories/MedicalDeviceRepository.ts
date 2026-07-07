import { MedicalDevice } from '../types';

export class MedicalDeviceRepository {
  async save(device: MedicalDevice): Promise<MedicalDevice> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<MedicalDevice | null> {
    throw new Error('Not implemented');
  }

  async findBySerialNumber(serialNumber: string): Promise<MedicalDevice | null> {
    throw new Error('Not implemented');
  }
}
