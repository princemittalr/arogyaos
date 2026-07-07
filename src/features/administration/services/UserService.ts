import { User } from '../types';
import { UserRepository } from '../repositories';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUserMetadata(user: Partial<User>): Promise<User> {
    throw new Error('Not implemented');
  }

  async updateUserMetadata(id: string, updates: Partial<User>): Promise<User> {
    throw new Error('Not implemented');
  }

  async deactivateUser(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async retrieveHistory(id: string): Promise<User[]> {
    throw new Error('Not implemented');
  }
}
