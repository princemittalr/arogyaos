import { TelemedicineSession } from '../types';
import { SessionRepository } from '../repositories';

export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(data: Partial<TelemedicineSession>): Promise<TelemedicineSession> {
    throw new Error('Not implemented');
  }

  async updateSession(id: string, data: Partial<TelemedicineSession>): Promise<TelemedicineSession> {
    throw new Error('Not implemented');
  }

  async startSession(id: string): Promise<TelemedicineSession> {
    throw new Error('Not implemented');
  }

  async endSession(id: string): Promise<TelemedicineSession> {
    throw new Error('Not implemented');
  }

  async cancelSession(id: string): Promise<TelemedicineSession> {
    throw new Error('Not implemented');
  }

  async getSessionHistory(userId: string, role: 'Patient' | 'Host'): Promise<TelemedicineSession[]> {
    throw new Error('Not implemented');
  }
}
