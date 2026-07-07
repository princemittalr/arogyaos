export type TriageLevel = 'ESI 1' | 'ESI 2' | 'ESI 3' | 'ESI 4' | 'ESI 5';
export type AmbulanceType = 'Basic Life Support' | 'Advanced Life Support' | 'Critical Care' | 'Neonatal' | 'Patient Transport' | 'Air Ambulance';

export type IncidentStatus = 'Reported' | 'Assigned' | 'Dispatched' | 'OnScene' | 'Transporting' | 'AtHospital' | 'Closed' | 'Cancelled';
export type DispatchStatus = 'Pending' | 'Accepted' | 'EnRoute' | 'Arrived' | 'Completed' | 'Rejected';
export type VehicleStatus = 'Available' | 'Dispatched' | 'InMaintenance' | 'OutOfService' | 'Cleaning';
export type CrewStatus = 'Available' | 'OnCall' | 'Dispatched' | 'OffDuty' | 'InTraining';

export interface VitalSigns {
  heartRate: number;
  respiratoryRate: number;
  bloodPressure: string;
  oxygenSaturation: number;
  temperature: number;
  recordedAt: string;
}

export interface TraumaAssessment {
  mechanismOfInjury: string;
  gcs: number;
  injuries: string[];
  findings: string;
}

export interface TriageAssessment {
  id: string;
  patientId?: string;
  assessorId: string;
  level: TriageLevel;
  chiefComplaint: string;
  vitalSigns: VitalSigns;
  traumaAssessment?: TraumaAssessment;
  timestamp: string;
}

export interface EmergencyPatient {
  id: string;
  name?: string;
  age?: number;
  gender?: string;
  triage: TriageAssessment;
  identified: boolean;
}

export interface EmergencyCall {
  id: string;
  callerNumber: string;
  callerName?: string;
  locationDetails: string;
  coordinates: { lat: number; lng: number };
  emergencyType: string;
  priority: string;
  timestamp: string;
  dispatcherId: string;
}

export interface EmergencyIncident {
  id: string;
  status: IncidentStatus;
  primaryCall: EmergencyCall;
  relatedCalls: EmergencyCall[];
  description: string;
  severity: string;
  createdAt: string;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface EmergencyRoute {
  id: string;
  startCoordinates: { lat: number; lng: number };
  endCoordinates: { lat: number; lng: number };
  waypoints: RouteWaypoint[];
  estimatedDistanceKm: number;
  estimatedDurationMs: number;
}

export interface EmergencyDestination {
  hospitalId: string;
  facilityName: string;
  departmentId: string;
  acceptedAt?: string;
}

export interface CrewMember {
  id: string;
  staffId: string;
  role: 'Driver' | 'Paramedic' | 'Doctor' | 'Nurse';
}

export interface Driver extends CrewMember {
  role: 'Driver';
  licenseClass: string;
}

export interface Paramedic extends CrewMember {
  role: 'Paramedic';
  certificationLevel: string;
}

export interface AmbulanceCrew {
  id: string;
  ambulanceId: string;
  members: CrewMember[];
  status: CrewStatus;
  shiftStart: string;
  shiftEnd: string;
}

export interface Ambulance {
  id: string;
  licensePlate: string;
  type: AmbulanceType;
  status: VehicleStatus;
  currentCoordinates?: { lat: number; lng: number };
  baseLocationId: string;
}

export interface DispatchAssignment {
  id: string;
  incidentId: string;
  ambulanceId: string;
  crewId: string;
  status: DispatchStatus;
  route: EmergencyRoute;
  destination?: EmergencyDestination;
  assignedAt: string;
}

export interface EmergencyDispatch {
  id: string;
  incidentId: string;
  assignments: DispatchAssignment[];
  dispatchedAt: string;
}

export interface EmergencyTreatment {
  id: string;
  patientId: string;
  providerId: string;
  procedure: string;
  timestamp: string;
}

export interface HospitalHandover {
  id: string;
  incidentId: string;
  patientId: string;
  receivingHospitalId: string;
  receivingStaffId: string;
  handoverTime: string;
  clinicalNotes: string;
}

export interface EmergencyTransfer {
  id: string;
  fromLocation: string;
  toLocation: string;
  patientId: string;
  transferType: string;
}

export interface ResponseTimeline {
  dispatchedAt: string;
  enRouteAt?: string;
  arrivedSceneAt?: string;
  departedSceneAt?: string;
  arrivedHospitalAt?: string;
  completedAt?: string;
}

export interface EmergencyResponse {
  id: string;
  dispatchId: string;
  timeline: ResponseTimeline;
  treatments: EmergencyTreatment[];
  handover?: HospitalHandover;
}

export interface EmergencyCase {
  id: string;
  incident: EmergencyIncident;
  dispatch?: EmergencyDispatch;
  patients: EmergencyPatient[];
  response?: EmergencyResponse;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyNotification {
  id: string;
  targetId: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface EmergencyResource {
  id: string;
  type: string;
  quantity: number;
}

export interface EmergencyEquipment {
  id: string;
  ambulanceId: string;
  name: string;
  status: 'Operational' | 'Faulty' | 'Maintenance';
}

export interface EmergencyMedication {
  id: string;
  ambulanceId: string;
  name: string;
  stockLevel: number;
}

export interface EmergencyReport {
  id: string;
  caseId: string;
  generatedBy: string;
  narrative: string;
  generatedAt: string;
}

export interface FleetStatistics {
  totalAmbulances: number;
  availableAmbulances: number;
  activeDispatches: number;
  maintenanceCount: number;
}

export interface ResponseStatistics {
  averageResponseTimeMs: number;
  averageSceneTimeMs: number;
  averageTransportTimeMs: number;
  totalCallsToday: number;
}
