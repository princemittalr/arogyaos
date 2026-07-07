import { SLA } from '../types';
import { SLARepository } from '../repositories';
export class SLAService {
  constructor(private readonly repo: SLARepository) {}
  async manageSLA(item: Partial<SLA>): Promise<SLA> { throw new Error('Not implemented'); }
}
