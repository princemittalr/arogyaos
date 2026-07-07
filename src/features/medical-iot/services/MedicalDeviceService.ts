import { MedicalDevice } from '../types';
import { MedicalDeviceRepository } from '../repositories';

export class MedicalDeviceService {
  constructor(private readonly deviceRepo: MedicalDeviceRepository) {}

  async registerDeviceMetadata(device: Partial<MedicalDevice>): Promise<MedicalDevice> {
    throw new Error('Not implemented');
  }

  async updateDeviceMetadata(id: string, updates: Partial<MedicalDevice>): Promise<MedicalDevice> {
    throw new Error('Not implemented');
  }

  async retireDevice(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async retrieveHistory(id: string): Promise<MedicalDevice[]> {
    throw new Error('Not implemented');
  }
}
