import { ColorToken } from '../types';
import { ColorTokenRepository } from '../repositories';

export class ColorTokenService {
  constructor(private readonly colorRepo: ColorTokenRepository) {}

  async manageColorTokenMetadata(token: Partial<ColorToken>): Promise<ColorToken> {
    throw new Error('Not implemented');
  }
}
