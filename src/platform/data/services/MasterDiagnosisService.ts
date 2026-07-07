import { MasterDiagnosis } from '../types';
import { MasterDiagnosisRepository } from '../repositories/MasterDiagnosisRepository';

export class MasterDiagnosisService {
  private static instance: MasterDiagnosisService;
  private repo = MasterDiagnosisRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterDiagnosisService {
    if (!MasterDiagnosisService.instance) {
      MasterDiagnosisService.instance = new MasterDiagnosisService();
    }
    return MasterDiagnosisService.instance;
  }

  public async create(data: MasterDiagnosis): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterDiagnosis | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterDiagnosis[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
