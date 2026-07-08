import { z } from 'zod';

export const GpsMetadataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number(),
  timestamp: z.string(),
});
export type GpsMetadata = z.infer<typeof GpsMetadataSchema>;

export const HouseholdMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  gender: z.string(),
  chronicConditions: z.array(z.string()).optional(),
});
export type HouseholdMember = z.infer<typeof HouseholdMemberSchema>;

export const HouseholdSchema = z.object({
  id: z.string(),
  village: z.string(),
  ward: z.string(),
  members: z.array(HouseholdMemberSchema),
});
export type Household = z.infer<typeof HouseholdSchema>;

export const VisitSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  workerId: z.string(),
  date: z.string(),
  outcome: z.string(),
  gps: GpsMetadataSchema.optional(),
  type: z.enum(['routine', 'maternal', 'child', 'chronic', 'emergency']),
});
export type Visit = z.infer<typeof VisitSchema>;

export const MaternalRecordSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  expectedDeliveryDate: z.string(),
  highRisk: z.boolean(),
  ancVisits: z.array(z.string()), // Visit IDs
  pncVisits: z.array(z.string()),
});
export type MaternalRecord = z.infer<typeof MaternalRecordSchema>;

export const ChildRecordSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  birthDate: z.string(),
  immunizations: z.record(z.string(), z.boolean()),
  growthMetrics: z.array(z.object({ date: z.string(), weight: z.number(), height: z.number() })),
});
export type ChildRecord = z.infer<typeof ChildRecordSchema>;

export const ChronicCareSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  condition: z.enum(['TB', 'Diabetes', 'Hypertension', 'Elderly']),
  lastFollowUp: z.string(),
  nextFollowUp: z.string(),
  medicinesDistributed: z.array(z.string()),
});
export type ChronicCareRecord = z.infer<typeof ChronicCareSchema>;

export const ReferralSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  reason: z.string(),
  urgency: z.enum(['standard', 'emergency']),
  destinationFacilityId: z.string(),
  status: z.enum(['pending', 'accepted', 'completed']),
});
export type Referral = z.infer<typeof ReferralSchema>;

export const DashboardMetricsSchema = z.object({
  totalHouseholds: z.number(),
  highRiskPregnancies: z.number(),
  pendingImmunizations: z.number(),
  upcomingVisits: z.number(),
});
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
