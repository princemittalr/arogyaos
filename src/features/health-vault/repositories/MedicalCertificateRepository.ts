import { BaseRepository } from './BaseRepository';
import { MedicalCertificateRecord } from '../types';

export class MedicalCertificateRepository extends BaseRepository<MedicalCertificateRecord> {
  constructor() {
    super('medical_certificates');
  }
}
export default MedicalCertificateRepository;
