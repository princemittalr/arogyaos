import { IntegrationConnector } from '../types';

export class ConnectorRepository {
  async save(connector: IntegrationConnector): Promise<IntegrationConnector> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<IntegrationConnector | null> {
    throw new Error('Not implemented');
  }
}
