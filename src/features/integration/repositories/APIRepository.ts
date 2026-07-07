import { API } from '../types';

export class APIRepository {
  async save(api: API): Promise<API> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<API | null> {
    throw new Error('Not implemented');
  }
}
