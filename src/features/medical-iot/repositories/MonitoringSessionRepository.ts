import { MonitoringSession } from '../types';

export class MonitoringSessionRepository {
  async save(session: MonitoringSession): Promise<MonitoringSession> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<MonitoringSession | null> {
    throw new Error('Not implemented');
  }

  async findByDeviceId(deviceId: string): Promise<MonitoringSession[]> {
    throw new Error('Not implemented');
  }
}
