import { RoleAssignment } from '../types';

export class RoleAssignmentRepository {
  async save(assignment: RoleAssignment): Promise<RoleAssignment> {
    throw new Error('Not implemented');
  }

  async findByUserId(userId: string): Promise<RoleAssignment[]> {
    throw new Error('Not implemented');
  }
}
