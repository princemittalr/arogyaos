import { InteroperabilityAudit } from '../types';
import { InteroperabilityAuditRepository } from '../repositories';
export class InteroperabilityAuditService {
  constructor(private readonly repo: InteroperabilityAuditRepository) {}
  async logInteropAudit(item: Partial<InteroperabilityAudit>): Promise<InteroperabilityAudit> { throw new Error('Not implemented'); }
}
