import { Observation } from '../types';

export class ObservationRepository {
  async save(observation: Observation): Promise<Observation> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Observation | null> {
    throw new Error('Not implemented');
  }

  async findBySessionId(sessionId: string): Promise<Observation[]> {
    throw new Error('Not implemented');
  }
}
