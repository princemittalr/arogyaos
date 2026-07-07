import { IntegrationConnector } from '../types';
import { ConnectorRepository } from '../repositories';

export class ConnectorService {
  constructor(private readonly connectorRepo: ConnectorRepository) {}

  async trackConnectorMetadata(connector: Partial<IntegrationConnector>): Promise<IntegrationConnector> {
    throw new Error('Not implemented');
  }

  async manageLifecycle(id: string, action: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
