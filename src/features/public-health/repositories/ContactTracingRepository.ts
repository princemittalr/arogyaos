import { ContactTracingCase, Contact } from '../types';

export class ContactTracingRepository {
  async findById(id: string): Promise<ContactTracingCase | null> {
    throw new Error('Not implemented');
  }

  async findByIndexCase(indexCaseId: string): Promise<ContactTracingCase | null> {
    throw new Error('Not implemented');
  }

  async save(tracingCase: ContactTracingCase): Promise<ContactTracingCase> {
    throw new Error('Not implemented');
  }

  async saveContact(caseId: string, contact: Contact): Promise<Contact> {
    throw new Error('Not implemented');
  }
}
