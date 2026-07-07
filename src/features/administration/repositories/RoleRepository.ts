import { Role } from '../types';

export class RoleRepository {
  async save(role: Role): Promise<Role> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Role | null> {
    throw new Error('Not implemented');
  }
}
