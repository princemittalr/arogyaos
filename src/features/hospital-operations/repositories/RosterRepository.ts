import { Roster } from '../types';

export class RosterRepository {
  async findById(id: string): Promise<Roster | null> {
    throw new Error('Not implemented');
  }

  async findByDepartment(departmentId: string, date: string): Promise<Roster | null> {
    throw new Error('Not implemented');
  }

  async save(roster: Roster): Promise<Roster> {
    throw new Error('Not implemented');
  }
}
