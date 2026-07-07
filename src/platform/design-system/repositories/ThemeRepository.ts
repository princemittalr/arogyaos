import { ThemeConfiguration } from '../types';

export class ThemeRepository {
  async save(theme: ThemeConfiguration): Promise<ThemeConfiguration> {
    throw new Error('Not implemented');
  }
}
