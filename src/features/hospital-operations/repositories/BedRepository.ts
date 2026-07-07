import { Bed, BedAllocation, BedStatus } from '../types';

export class BedRepository {
  async findById(id: string): Promise<Bed | null> {
    throw new Error('Not implemented');
  }

  async findByRoom(roomId: string): Promise<Bed[]> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: BedStatus): Promise<void> {
    throw new Error('Not implemented');
  }

  async saveAllocation(allocation: BedAllocation): Promise<BedAllocation> {
    throw new Error('Not implemented');
  }

  async getActiveAllocation(bedId: string): Promise<BedAllocation | null> {
    throw new Error('Not implemented');
  }
}
