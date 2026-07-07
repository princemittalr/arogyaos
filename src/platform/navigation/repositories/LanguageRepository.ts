import { LanguageConfiguration } from '../types';

export class LanguageRepository {
  async save(language: LanguageConfiguration): Promise<LanguageConfiguration> {
    throw new Error('Not implemented');
  }
}
