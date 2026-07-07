import { AlertEvent } from '../types';

export class AlertRepository {
  async save(alert: AlertEvent): Promise<AlertEvent> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<AlertEvent | null> {
    throw new Error('Not implemented');
  }

  async findByPatientId(patientId: string): Promise<AlertEvent[]> {
    throw new Error('Not implemented');
  }
}
