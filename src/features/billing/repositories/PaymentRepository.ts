import { Payment, PaymentStatus } from '../types';

export class PaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    throw new Error('Not implemented');
  }

  async save(payment: Payment): Promise<Payment> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    throw new Error('Not implemented');
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    throw new Error('Not implemented');
  }
}
