import { EscalationPolicy } from '../types';
import { EscalationPolicyRepository } from '../repositories';
export class EscalationPolicyService {
  constructor(private readonly repo: EscalationPolicyRepository) {}
  async manageEscalationPolicy(item: Partial<EscalationPolicy>): Promise<EscalationPolicy> { throw new Error('Not implemented'); }
}
