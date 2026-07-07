import { ConnectorHealth } from '../types';

export class ConnectorHealthRepository {
  async save(health: ConnectorHealth): Promise<ConnectorHealth> {
    throw new Error('Not implemented');
  }

  async findByConnectorId(connectorId: string): Promise<ConnectorHealth | null> {
    throw new Error('Not implemented');
  }
}
