import { RoleAssignment } from '../types';
import { RoleAssignmentRepository } from '../repositories';
export class RoleAssignmentService {
  constructor(private readonly repo: RoleAssignmentRepository) {}
  async manageRoleAssignment(item: Partial<RoleAssignment>): Promise<RoleAssignment> { throw new Error('Not implemented'); }
}
