import { IconToken } from '../types';

export class IconRepository {
  async save(icon: IconToken): Promise<IconToken> {
    throw new Error('Not implemented');
  }
}
