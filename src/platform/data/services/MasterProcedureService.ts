import { MasterProcedure } from '../types';
import { MasterProcedureRepository } from '../repositories/MasterProcedureRepository';

export class MasterProcedureService {
  private static instance: MasterProcedureService;
  private repo = MasterProcedureRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterProcedureService {
    if (!MasterProcedureService.instance) {
      MasterProcedureService.instance = new MasterProcedureService();
    }
    return MasterProcedureService.instance;
  }

  public async create(data: MasterProcedure): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterProcedure | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterProcedure[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
