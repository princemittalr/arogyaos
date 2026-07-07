import { Session } from '../types';

export class SessionRepository {
  async save(session: Session): Promise<Session> {
    throw new Error('Not implemented');
  }

  async findByUserId(userId: string): Promise<Session[]> {
    throw new Error('Not implemented');
  }
}
