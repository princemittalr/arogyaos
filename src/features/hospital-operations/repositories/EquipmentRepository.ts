import { Equipment, EquipmentAssignment, EquipmentReservation, EquipmentStatus } from '../types';

export class EquipmentRepository {
  async findById(id: string): Promise<Equipment | null> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: EquipmentStatus): Promise<void> {
    throw new Error('Not implemented');
  }

  async saveAssignment(assignment: EquipmentAssignment): Promise<EquipmentAssignment> {
    throw new Error('Not implemented');
  }

  async saveReservation(reservation: EquipmentReservation): Promise<EquipmentReservation> {
    throw new Error('Not implemented');
  }
}
