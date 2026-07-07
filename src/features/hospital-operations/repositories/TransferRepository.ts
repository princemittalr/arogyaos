import { Transfer, TransferStatus } from '../types';

export class TransferRepository {
  async findById(id: string): Promise<Transfer | null> {
    throw new Error('Not implemented');
  }

  async findByAdmission(admissionId: string): Promise<Transfer[]> {
    throw new Error('Not implemented');
  }

  async save(transfer: Transfer): Promise<Transfer> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: TransferStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
