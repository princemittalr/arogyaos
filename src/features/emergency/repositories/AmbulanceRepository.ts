import { Ambulance, VehicleStatus } from '../types';

export class AmbulanceRepository {
  async findById(id: string): Promise<Ambulance | null> {
    throw new Error('Not implemented');
  }

  async findAvailable(): Promise<Ambulance[]> {
    throw new Error('Not implemented');
  }

  async save(ambulance: Ambulance): Promise<Ambulance> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: VehicleStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
