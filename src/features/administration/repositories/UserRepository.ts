import { User } from '../types';

export class UserRepository {
  async save(user: User): Promise<User> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<User | null> {
    throw new Error('Not implemented');
  }
}
