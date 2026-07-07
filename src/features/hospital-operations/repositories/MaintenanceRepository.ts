import { MaintenanceRequest, MaintenanceSchedule, MaintenanceStatus } from '../types';

export class MaintenanceRepository {
  async findRequestById(id: string): Promise<MaintenanceRequest | null> {
    throw new Error('Not implemented');
  }

  async findByEquipment(equipmentId: string): Promise<MaintenanceRequest[]> {
    throw new Error('Not implemented');
  }

  async saveRequest(request: MaintenanceRequest): Promise<MaintenanceRequest> {
    throw new Error('Not implemented');
  }

  async saveSchedule(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: MaintenanceStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
