import { Invoice, InvoiceStatus } from '../types';

export class InvoiceRepository {
  async findById(id: string): Promise<Invoice | null> {
    throw new Error('Not implemented');
  }

  async save(invoice: Invoice): Promise<Invoice> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<void> {
    throw new Error('Not implemented');
  }

  async findByPatient(patientId: string): Promise<Invoice[]> {
    throw new Error('Not implemented');
  }
}
