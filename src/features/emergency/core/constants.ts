export const INCIDENT_STATUSES = [
  'Reported',
  'Assigned',
  'Dispatched',
  'OnScene',
  'Transporting',
  'AtHospital',
  'Closed',
  'Cancelled'
] as const;

export const DISPATCH_STATUSES = [
  'Pending',
  'Accepted',
  'EnRoute',
  'Arrived',
  'Completed',
  'Rejected'
] as const;

export const VEHICLE_STATUSES = [
  'Available',
  'Dispatched',
  'InMaintenance',
  'OutOfService',
  'Cleaning'
] as const;

export const CREW_STATUSES = [
  'Available',
  'OnCall',
  'Dispatched',
  'OffDuty',
  'InTraining'
] as const;

export const TRIAGE_CATEGORIES = [
  'ESI 1', // Resuscitation (Immediate)
  'ESI 2', // Emergent (14 mins)
  'ESI 3', // Urgent (60 mins)
  'ESI 4', // Less Urgent (120 mins)
  'ESI 5'  // Non-Urgent (240 mins)
] as const;

export const EMERGENCY_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical'
] as const;

export const EMERGENCY_TYPES = [
  'Cardiac Arrest',
  'Trauma',
  'Stroke',
  'Respiratory Distress',
  'Obstetric',
  'Psychiatric',
  'Burn',
  'Poisoning',
  'Other'
] as const;

export const AMBULANCE_TYPES = [
  'Basic Life Support',
  'Advanced Life Support',
  'Critical Care',
  'Neonatal',
  'Patient Transport',
  'Air Ambulance'
] as const;

export const EQUIPMENT_STATUSES = [
  'Operational',
  'Faulty',
  'Maintenance'
] as const;

export const SUPPORTED_FILTERS = [
  'status',
  'priority',
  'ambulanceType',
  'dateRange',
  'triageLevel'
] as const;

export const SEARCH_FIELDS = [
  'incidentId',
  'callerName',
  'patientName',
  'location'
] as const;

export const DEFAULT_DISPATCH_RULES = {
  MAX_DISPATCH_RADIUS_KM: 50,
  TARGET_RESPONSE_TIME_URGENT_MS: 480000, // 8 minutes
  TARGET_RESPONSE_TIME_NON_URGENT_MS: 1200000 // 20 minutes
} as const;
