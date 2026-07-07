import { MedicalGateway } from '../types';

export class GatewayRepository {
  async save(gateway: MedicalGateway): Promise<MedicalGateway> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<MedicalGateway | null> {
    throw new Error('Not implemented');
  }
}
