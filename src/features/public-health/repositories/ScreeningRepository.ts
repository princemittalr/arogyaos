import { ScreeningProgram } from '../types';

export class ScreeningRepository {
  async findById(id: string): Promise<ScreeningProgram | null> {
    throw new Error('Not implemented');
  }

  async findActivePrograms(): Promise<ScreeningProgram[]> {
    throw new Error('Not implemented');
  }

  async save(program: ScreeningProgram): Promise<ScreeningProgram> {
    throw new Error('Not implemented');
  }
}
