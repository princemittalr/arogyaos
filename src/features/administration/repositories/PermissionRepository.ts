import { Permission } from '../types';

export class PermissionRepository {
  async save(permission: Permission): Promise<Permission> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Permission | null> {
    throw new Error('Not implemented');
  }
}
