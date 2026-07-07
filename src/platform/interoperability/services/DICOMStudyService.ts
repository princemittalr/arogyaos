import { DICOMStudy } from '../types';
import { DICOMStudyRepository } from '../repositories';
export class DICOMStudyService {
  constructor(private readonly repo: DICOMStudyRepository) {}
  async manageDICOMStudyMetadata(item: Partial<DICOMStudy>): Promise<DICOMStudy> { throw new Error('Not implemented'); }
}
