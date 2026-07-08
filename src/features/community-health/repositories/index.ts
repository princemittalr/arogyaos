import { Household, Visit, MaternalRecord, ChildRecord, ChronicCareRecord, Referral, DashboardMetrics } from '../types';

export interface IHouseholdRepository {
  getAssignedHouseholds(workerId: string): Promise<Household[]>;
  getHousehold(id: string): Promise<Household>;
  saveHousehold(household: Household): Promise<void>;
}

export interface IVisitRepository {
  getVisits(workerId: string): Promise<Visit[]>;
  scheduleVisit(visit: Omit<Visit, 'id'>): Promise<Visit>;
  completeVisit(visitId: string, outcome: string, gps?: any): Promise<void>;
}

export interface IMaternalCareRepository {
  getHighRiskPregnancies(workerId: string): Promise<MaternalRecord[]>;
  updateRecord(record: MaternalRecord): Promise<void>;
}

export interface IChildCareRepository {
  getPendingImmunizations(workerId: string): Promise<ChildRecord[]>;
  recordGrowth(childId: string, weight: number, height: number): Promise<void>;
}

export interface IChronicCareRepository {
  getFollowUps(workerId: string, condition?: string): Promise<ChronicCareRecord[]>;
  logMedicineDistribution(recordId: string, medicines: string[]): Promise<void>;
}

export interface IReferralRepository {
  createReferral(referral: Omit<Referral, 'id' | 'status'>): Promise<Referral>;
  getReferrals(workerId: string): Promise<Referral[]>;
}

export interface ICommunityAnalyticsRepository {
  getMetrics(workerId: string): Promise<DashboardMetrics>;
}
