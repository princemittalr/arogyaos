import { AccessibilityToken } from '../types';

export class AccessibilityRepository {
  async save(config: AccessibilityToken): Promise<AccessibilityToken> {
    throw new Error('Not implemented');
  }
}
