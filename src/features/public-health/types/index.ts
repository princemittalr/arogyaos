export type DiseaseStatus = 'Active' | 'Contained' | 'Eradicated' | 'Monitoring';
export type CaseStatus = 'Suspected' | 'Probable' | 'Confirmed' | 'Recovered' | 'Deceased';
export type InvestigationStatus = 'Pending' | 'InProgress' | 'Completed' | 'Closed';
export type OutbreakStatus = 'Detected' | 'Escalating' | 'Contained' | 'Resolved';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical';
export type AlertLevel = 'Info' | 'Warning' | 'Action' | 'Emergency';
export type CampaignStatus = 'Planned' | 'Active' | 'Paused' | 'Completed';
export type ScreeningStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
export type CasePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ReportingLevel = 'Facility' | 'District' | 'State' | 'National';

export interface CaseLocation {
  lat: number;
  lng: number;
  address: string;
  districtId: string;
  stateId: string;
}

export interface DiseaseCase {
  id: string;
  patientId?: string; // Optional for anonymized surveillance
  diseaseId: string;
  status: CaseStatus;
  priority: CasePriority;
  location: CaseLocation;
  symptomOnsetAt: string;
  reportedAt: string;
  updatedAt: string;
}

export interface NotifiableDisease {
  id: string;
  name: string;
  icd10Code: string;
  incubationPeriodDays: number;
  infectiousPeriodDays: number;
  reportableLevel: ReportingLevel;
}

export interface DiseaseReport {
  id: string;
  facilityId: string;
  diseaseId: string;
  caseCount: number;
  periodStart: string;
  periodEnd: string;
  submittedAt: string;
  submittedBy: string;
}

export interface DiseaseInvestigation {
  id: string;
  caseId: string;
  investigatorId: string;
  status: InvestigationStatus;
  findings: string;
  startedAt: string;
  completedAt?: string;
}

export interface Outbreak {
  id: string;
  diseaseId: string;
  status: OutbreakStatus;
  severity: RiskLevel;
  primaryLocation: CaseLocation;
  declaredAt: string;
  resolvedAt?: string;
}

export interface OutbreakCluster {
  id: string;
  outbreakId: string;
  location: CaseLocation;
  caseIds: string[];
  radiusKm: number;
}

export interface ExposureEvent {
  id: string;
  location: string;
  date: string;
  riskLevel: RiskLevel;
  description: string;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  relationship: string;
  exposureDate: string;
  riskLevel: RiskLevel;
}

export interface ContactTracingCase {
  id: string;
  indexCaseId: string;
  tracerId: string;
  contacts: Contact[];
  exposureEvents: ExposureEvent[];
  status: InvestigationStatus;
}

export interface VaccinationCoverage {
  id: string;
  diseaseId: string;
  locationId: string;
  locationLevel: ReportingLevel;
  targetPopulation: number;
  dosesAdministered: number;
  coveragePercentage: number;
  recordedAt: string;
}

export interface DemographicGroup {
  ageGroup: string;
  gender: string;
  population: number;
}

export interface AgeDistribution {
  group: string;
  count: number;
  percentage: number;
}

export interface ScreeningProgram {
  id: string;
  diseaseId: string;
  name: string;
  status: ScreeningStatus;
  targetDemographics: DemographicGroup[];
  startDate: string;
  endDate: string;
}

export interface PopulationHealthIndicator {
  id: string;
  name: string;
  value: number;
  unit: string;
  locationId: string;
  locationLevel: ReportingLevel;
  recordedAt: string;
}

export interface HealthSurvey {
  id: string;
  title: string;
  targetDemographics: DemographicGroup[];
  responsesCount: number;
  startDate: string;
  endDate: string;
}

export interface DiseaseTrend {
  diseaseId: string;
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  percentageChange: number;
  timeframeDays: number;
}

export interface DiseaseForecast {
  diseaseId: string;
  locationId: string;
  predictedCases: number;
  confidenceInterval: [number, number];
  forecastDate: string;
}

export interface RiskAssessment {
  id: string;
  targetId: string; // Region or Facility ID
  assessorId: string;
  level: RiskLevel;
  factors: string[];
  assessedAt: string;
}

export interface HealthAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  targetLocations: string[]; // District or State IDs
  issuedAt: string;
  expiresAt: string;
}

export interface CampaignTarget {
  demographicGroup: string;
  locationId: string;
}

export interface CampaignResult {
  reachedCount: number;
  engagementRate: number;
  recordedAt: string;
}

export interface PublicHealthCampaign {
  id: string;
  title: string;
  status: CampaignStatus;
  targets: CampaignTarget[];
  results: CampaignResult[];
  startDate: string;
  endDate: string;
}

export interface MortalityStatistics {
  diseaseId: string;
  totalDeaths: number;
  mortalityRate: number; // per 100,000
  recordedAt: string;
}

export interface MorbidityStatistics {
  diseaseId: string;
  totalCases: number;
  morbidityRate: number; // per 100,000
  recordedAt: string;
}

export interface HealthFacilityReport {
  id: string;
  facilityId: string;
  periodStart: string;
  periodEnd: string;
  totalOutpatientVisits: number;
  notifiableDiseaseReports: number;
  submittedAt: string;
}

export interface DistrictStatistics {
  districtId: string;
  totalPopulation: number;
  activeOutbreaks: number;
  vaccinationCoverage: Record<string, number>; // DiseaseId -> Coverage %
  updatedAt: string;
}

export interface StateStatistics {
  stateId: string;
  totalPopulation: number;
  activeOutbreaks: number;
  vaccinationCoverage: Record<string, number>;
  updatedAt: string;
}

export interface NationalStatistics {
  countryId: string;
  totalPopulation: number;
  activeOutbreaks: number;
  vaccinationCoverage: Record<string, number>;
  updatedAt: string;
}

export interface EpidemiologyReport {
  id: string;
  title: string;
  authorId: string;
  content: string; // Markdown or rich text
  diseaseTrends: DiseaseTrend[];
  generatedAt: string;
}
