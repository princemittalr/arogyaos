import { MotionToken } from '../types';

export class MotionRepository {
  async save(motion: MotionToken): Promise<MotionToken> {
    throw new Error('Not implemented');
  }
}
