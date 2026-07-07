import { BreakpointToken } from '../types';

export class BreakpointRepository {
  async save(breakpoint: BreakpointToken): Promise<BreakpointToken> {
    throw new Error('Not implemented');
  }
}
