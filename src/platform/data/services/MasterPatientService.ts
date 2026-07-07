import { MasterPatient } from '../types';
import { MasterPatientRepository } from '../repositories/MasterPatientRepository';

export class MasterPatientService {
  private static instance: MasterPatientService;
  private repo = MasterPatientRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterPatientService {
    if (!MasterPatientService.instance) {
      MasterPatientService.instance = new MasterPatientService();
    }
    return MasterPatientService.instance;
  }

  public async create(data: MasterPatient): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterPatient | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterPatient[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
