import { Invoice, InvoiceItem } from '../types';
import { InvoiceRepository } from '../repositories';

export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    throw new Error('Not implemented');
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    throw new Error('Not implemented');
  }

  async voidInvoice(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async issueInvoice(id: string): Promise<Invoice> {
    throw new Error('Not implemented');
  }

  async getInvoiceHistory(patientId: string): Promise<Invoice[]> {
    throw new Error('Not implemented');
  }

  async addLineItem(invoiceId: string, item: InvoiceItem): Promise<Invoice> {
    throw new Error('Not implemented');
  }

  async removeLineItem(invoiceId: string, itemId: string): Promise<Invoice> {
    throw new Error('Not implemented');
  }
}
