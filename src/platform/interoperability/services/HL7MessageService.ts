import { HL7Message } from '../types';
import { HL7MessageRepository } from '../repositories';
export class HL7MessageService {
  constructor(private readonly repo: HL7MessageRepository) {}
  async manageHL7MessageMetadata(item: Partial<HL7Message>): Promise<HL7Message> { throw new Error('Not implemented'); }
}
