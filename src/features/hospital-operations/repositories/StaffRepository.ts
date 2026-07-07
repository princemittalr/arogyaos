import { StaffAssignment, Shift } from '../types';

export class StaffRepository {
  async findAssignmentById(id: string): Promise<StaffAssignment | null> {
    throw new Error('Not implemented');
  }

  async findAssignmentsByStaff(staffId: string, date: string): Promise<StaffAssignment[]> {
    throw new Error('Not implemented');
  }

  async saveAssignment(assignment: StaffAssignment): Promise<StaffAssignment> {
    throw new Error('Not implemented');
  }

  async findShift(shiftId: string): Promise<Shift | null> {
    throw new Error('Not implemented');
  }
}
