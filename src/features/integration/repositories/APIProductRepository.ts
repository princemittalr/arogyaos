import { APIProduct } from '../types';

export class APIProductRepository {
  async save(product: APIProduct): Promise<APIProduct> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<APIProduct | null> {
    throw new Error('Not implemented');
  }
}
