import { LayoutToken } from '../types';

export class LayoutRepository {
  async save(layout: LayoutToken): Promise<LayoutToken> {
    throw new Error('Not implemented');
  }
}
