import { Role } from '../types';
import { RoleRepository } from '../repositories';

export class RoleService {
  constructor(private readonly roleRepo: RoleRepository) {}

  async createRoleMetadata(role: Partial<Role>): Promise<Role> {
    throw new Error('Not implemented');
  }

  async updateRoleMetadata(id: string, updates: Partial<Role>): Promise<Role> {
    throw new Error('Not implemented');
  }

  async assignPermissions(id: string, permissions: string[]): Promise<Role> {
    throw new Error('Not implemented');
  }
}
