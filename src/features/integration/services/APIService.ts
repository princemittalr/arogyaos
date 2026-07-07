import { API, APIEndpoint } from '../types';
import { APIRepository } from '../repositories';

export class APIService {
  constructor(private readonly apiRepo: APIRepository) {}

  async createAPIMetadata(api: Partial<API>): Promise<API> {
    throw new Error('Not implemented');
  }

  async trackEndpointMetadata(endpoint: Partial<APIEndpoint>): Promise<APIEndpoint> {
    throw new Error('Not implemented');
  }
}
