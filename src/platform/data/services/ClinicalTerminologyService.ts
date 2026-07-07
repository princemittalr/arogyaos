import { ClinicalTerminology } from '../types';
import { ClinicalTerminologyRepository } from '../repositories/ClinicalTerminologyRepository';

export class ClinicalTerminologyService {
  private static instance: ClinicalTerminologyService;
  private repo = ClinicalTerminologyRepository.getInstance();

  private constructor() {}

  public static getInstance(): ClinicalTerminologyService {
    if (!ClinicalTerminologyService.instance) {
      ClinicalTerminologyService.instance = new ClinicalTerminologyService();
    }
    return ClinicalTerminologyService.instance;
  }

  public async create(data: ClinicalTerminology): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ClinicalTerminology | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ClinicalTerminology[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
