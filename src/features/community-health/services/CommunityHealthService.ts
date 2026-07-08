import { IHouseholdRepository, IVisitRepository, IMaternalCareRepository, IReferralRepository } from '../repositories';
import { Visit, Referral } from '../types';
import { ulid } from '@/features/health-vault/utils/ulid';

export class CommunityHealthService {
  constructor(
    private householdRepo: IHouseholdRepository,
    private visitRepo: IVisitRepository,
    private maternalRepo: IMaternalCareRepository,
    private referralRepo: IReferralRepository
  ) {}

  async getDashboardOverview(workerId: string) {
    const [households, visits, highRisk] = await Promise.all([
      this.householdRepo.getAssignedHouseholds(workerId),
      this.visitRepo.getVisits(workerId),
      this.maternalRepo.getHighRiskPregnancies(workerId)
    ]);
    
    return {
      totalHouseholds: households.length,
      upcomingVisits: visits.filter(v => new Date(v.date) >= new Date()).length,
      highRiskPregnancies: highRisk.length,
    };
  }

  async recordVisitOffline(visit: Omit<Visit, 'id'>) {
    // Generates a cryptographically secure, monotonic ID for offline sync
    const tempId = `temp_${ulid()}`;
    const newVisit: Visit = { ...visit, id: tempId };
    return newVisit;
  }

  async escalateEmergency(memberId: string, reason: string, facilityId: string): Promise<Referral> {
    return this.referralRepo.createReferral({
      memberId,
      reason,
      urgency: 'emergency',
      destinationFacilityId: facilityId
    });
  }
}
