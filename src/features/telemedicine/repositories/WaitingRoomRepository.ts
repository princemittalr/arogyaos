import { WaitingRoom } from '../types';

export class WaitingRoomRepository {
  async findById(id: string): Promise<WaitingRoom | null> {
    throw new Error('Not implemented');
  }

  async findBySessionId(sessionId: string): Promise<WaitingRoom | null> {
    throw new Error('Not implemented');
  }

  async save(waitingRoom: WaitingRoom): Promise<WaitingRoom> {
    throw new Error('Not implemented');
  }
}
