import { PlatformEvent } from '../types';

export class PlatformEventRepository {
  async save(event: PlatformEvent): Promise<PlatformEvent> {
    throw new Error('Not implemented');
  }
}
