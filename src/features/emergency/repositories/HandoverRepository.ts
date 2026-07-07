import { HospitalHandover } from '../types';

export class HandoverRepository {
  async findById(id: string): Promise<HospitalHandover | null> {
    throw new Error('Not implemented');
  }

  async findByIncidentId(incidentId: string): Promise<HospitalHandover | null> {
    throw new Error('Not implemented');
  }

  async save(handover: HospitalHandover): Promise<HospitalHandover> {
    throw new Error('Not implemented');
  }
}
