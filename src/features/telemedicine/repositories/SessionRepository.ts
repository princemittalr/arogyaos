import { TelemedicineSession, SessionStatus } from '../types';

export class SessionRepository {
  async findById(id: string): Promise<TelemedicineSession | null> {
    throw new Error('Not implemented');
  }

  async save(session: TelemedicineSession): Promise<TelemedicineSession> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: SessionStatus): Promise<void> {
    throw new Error('Not implemented');
  }

  async findByHostId(hostId: string): Promise<TelemedicineSession[]> {
    throw new Error('Not implemented');
  }

  async findByPatientId(patientId: string): Promise<TelemedicineSession[]> {
    throw new Error('Not implemented');
  }
}
