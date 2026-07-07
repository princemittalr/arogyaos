import { Consent } from '../types';

export class ConsentRepository {
  async save(consent: Consent): Promise<Consent> {
    throw new Error('Not implemented');
  }
}
