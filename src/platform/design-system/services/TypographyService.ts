import { TypographyToken } from '../types';
import { TypographyRepository } from '../repositories';

export class TypographyService {
  constructor(private readonly typoRepo: TypographyRepository) {}

  async manageTypographyMetadata(token: Partial<TypographyToken>): Promise<TypographyToken> {
    throw new Error('Not implemented');
  }
}
