import { ThemeConfiguration } from '../types';
import { ThemeRepository } from '../repositories';

export class ThemeService {
  constructor(private readonly themeRepo: ThemeRepository) {}

  async manageThemeMetadata(theme: Partial<ThemeConfiguration>): Promise<ThemeConfiguration> {
    throw new Error('Not implemented');
  }
}
