import { MasterMedication } from '../types';
import { MasterMedicationRepository } from '../repositories/MasterMedicationRepository';

export class MasterMedicationService {
  private static instance: MasterMedicationService;
  private repo = MasterMedicationRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterMedicationService {
    if (!MasterMedicationService.instance) {
      MasterMedicationService.instance = new MasterMedicationService();
    }
    return MasterMedicationService.instance;
  }

  public async create(data: MasterMedication): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterMedication | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterMedication[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
