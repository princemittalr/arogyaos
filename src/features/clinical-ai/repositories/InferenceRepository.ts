import { InferenceRequest, InferenceResponse } from '../types';

export class InferenceRepository {
  async saveRequest(request: InferenceRequest): Promise<InferenceRequest> {
    throw new Error('Not implemented');
  }

  async saveResponse(response: InferenceResponse): Promise<InferenceResponse> {
    throw new Error('Not implemented');
  }

  async findRequestById(id: string): Promise<InferenceRequest | null> {
    throw new Error('Not implemented');
  }

  async findResponseByRequestId(requestId: string): Promise<InferenceResponse | null> {
    throw new Error('Not implemented');
  }
}
