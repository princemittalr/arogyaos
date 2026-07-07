import { BillingAccount, BillingProfile } from '../types';

export class BillingAccountRepository {
  async findAccountById(id: string): Promise<BillingAccount | null> {
    throw new Error('Not implemented');
  }

  async findAccountByProfile(profileId: string): Promise<BillingAccount | null> {
    throw new Error('Not implemented');
  }

  async saveAccount(account: BillingAccount): Promise<BillingAccount> {
    throw new Error('Not implemented');
  }

  async findProfileByPatient(patientId: string): Promise<BillingProfile | null> {
    throw new Error('Not implemented');
  }
}
