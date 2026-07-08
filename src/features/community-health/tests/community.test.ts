import { describe, it, expect, vi } from 'vitest';
import { CommunityHealthService } from '../services/CommunityHealthService';
import { IHouseholdRepository, IVisitRepository, IMaternalCareRepository, IReferralRepository } from '../repositories';

describe('CommunityHealthService', () => {
  const mockHouseholdRepo: IHouseholdRepository = {
    getAssignedHouseholds: vi.fn().mockResolvedValue([{ id: '1' }]),
    getHousehold: vi.fn(),
    saveHousehold: vi.fn(),
  };
  
  const mockVisitRepo: IVisitRepository = {
    getVisits: vi.fn().mockResolvedValue([]),
    scheduleVisit: vi.fn(),
    completeVisit: vi.fn(),
  };
  
  const mockMaternalRepo: IMaternalCareRepository = {
    getHighRiskPregnancies: vi.fn().mockResolvedValue([{ id: 'm1' }]),
    updateRecord: vi.fn(),
  };

  const mockReferralRepo: IReferralRepository = {
    createReferral: vi.fn().mockImplementation((r) => Promise.resolve({ ...r, id: 'r1', status: 'pending' })),
    getReferrals: vi.fn(),
  };

  const service = new CommunityHealthService(mockHouseholdRepo, mockVisitRepo, mockMaternalRepo, mockReferralRepo);

  it('aggregates dashboard metrics correctly', async () => {
    const metrics = await service.getDashboardOverview('worker-1');
    expect(metrics.totalHouseholds).toBe(1);
    expect(metrics.highRiskPregnancies).toBe(1);
    expect(metrics.upcomingVisits).toBe(0);
  });

  it('escalates emergencies', async () => {
    const referral = await service.escalateEmergency('member-1', 'Severe bleeding', 'hospital-1');
    expect(referral.urgency).toBe('emergency');
    expect(referral.destinationFacilityId).toBe('hospital-1');
  });
});
