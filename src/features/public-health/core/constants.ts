export const DISEASE_STATUSES = [
  'Active',
  'Contained',
  'Eradicated',
  'Monitoring'
] as const;

export const CASE_STATUSES = [
  'Suspected',
  'Probable',
  'Confirmed',
  'Recovered',
  'Deceased'
] as const;

export const INVESTIGATION_STATUSES = [
  'Pending',
  'InProgress',
  'Completed',
  'Closed'
] as const;

export const OUTBREAK_STATUSES = [
  'Detected',
  'Escalating',
  'Contained',
  'Resolved'
] as const;

export const RISK_LEVELS = [
  'Low',
  'Moderate',
  'High',
  'Severe',
  'Critical'
] as const;

export const ALERT_LEVELS = [
  'Info',
  'Warning',
  'Action',
  'Emergency'
] as const;

export const CAMPAIGN_STATUSES = [
  'Planned',
  'Active',
  'Paused',
  'Completed'
] as const;

export const SCREENING_STATUSES = [
  'Scheduled',
  'InProgress',
  'Completed',
  'Cancelled'
] as const;

export const CASE_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent'
] as const;

export const REPORTING_LEVELS = [
  'Facility',
  'District',
  'State',
  'National'
] as const;

export const SUPPORTED_FILTERS = [
  'diseaseId',
  'status',
  'riskLevel',
  'districtId',
  'dateRange'
] as const;

export const SEARCH_FIELDS = [
  'caseId',
  'outbreakId',
  'campaignTitle',
  'location'
] as const;

export const DEFAULT_THRESHOLDS = {
  OUTBREAK_DETECTION_CASES: 5,
  EPIDEMIC_ALERT_INCIDENCE_RATE: 50, // Cases per 100,000
  VACCINATION_HERD_IMMUNITY_TARGET: 85, // Percentage
} as const;
