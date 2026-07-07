import { Ward, Room } from '../types';

export class WardRepository {
  async findWardById(id: string): Promise<Ward | null> {
    throw new Error('Not implemented');
  }

  async findWardsByFloor(floorId: string): Promise<Ward[]> {
    throw new Error('Not implemented');
  }

  async findRoomsByWard(wardId: string): Promise<Room[]> {
    throw new Error('Not implemented');
  }

  async saveWard(ward: Ward): Promise<Ward> {
    throw new Error('Not implemented');
  }
}
