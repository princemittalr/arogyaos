import { AmbulanceCrew, CrewStatus } from '../types';

export class CrewRepository {
  async findById(id: string): Promise<AmbulanceCrew | null> {
    throw new Error('Not implemented');
  }

  async findAvailable(): Promise<AmbulanceCrew[]> {
    throw new Error('Not implemented');
  }

  async save(crew: AmbulanceCrew): Promise<AmbulanceCrew> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: CrewStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
