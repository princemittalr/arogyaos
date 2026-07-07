import { Participant } from '../types';

export class ParticipantRepository {
  async findById(id: string): Promise<Participant | null> {
    throw new Error('Not implemented');
  }

  async findBySessionId(sessionId: string): Promise<Participant[]> {
    throw new Error('Not implemented');
  }

  async save(participant: Participant): Promise<Participant> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
