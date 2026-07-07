export type AdmissionStatus = 'Scheduled' | 'Admitted' | 'Observation' | 'Discharged' | 'Transferred' | 'Cancelled' | 'Deceased';
export type TransferStatus = 'Requested' | 'Approved' | 'InProgress' | 'Completed' | 'Cancelled' | 'Rejected';
export type DischargeStatus = 'Pending' | 'Approved' | 'Completed' | 'AMA' | 'Transferred';
export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance' | 'Blocked';
export type RoomStatus = 'Available' | 'Partial' | 'Full' | 'Maintenance' | 'Closed';
export type EquipmentStatus = 'Available' | 'InUse' | 'Maintenance' | 'Broken' | 'Decommissioned';
export type MaintenanceStatus = 'Pending' | 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
export type ShiftStatus = 'Scheduled' | 'Active' | 'Completed' | 'Cancelled' | 'OnCall';

export type WardType = 'General Ward' | 'ICU' | 'NICU' | 'PICU' | 'HDU' | 'Emergency' | 'Isolation' | 'Recovery' | 'Operation Theatre' | 'Day Care';

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: BedStatus;
  type: string;
  features: string[];
}

export interface Room {
  id: string;
  wardId: string;
  roomNumber: string;
  status: RoomStatus;
  beds: Bed[];
  capacity: number;
  type: string;
}

export interface Ward {
  id: string;
  floorId: string;
  name: string;
  type: WardType;
  rooms: Room[];
  capacity: number;
  occupied: number;
}

export interface Floor {
  id: string;
  buildingId: string;
  level: number;
  name: string;
  wards: Ward[];
}

export interface Building {
  id: string;
  campusId: string;
  name: string;
  floors: Floor[];
}

export interface Campus {
  id: string;
  hospitalId: string;
  name: string;
  buildings: Building[];
}

export interface Hospital {
  id: string;
  name: string;
  campuses: Campus[];
}

export interface BedAllocation {
  id: string;
  admissionId: string;
  bedId: string;
  allocatedAt: string;
  releasedAt?: string;
  status: 'Active' | 'Completed';
}

export interface Admission {
  id: string;
  patientId: string;
  attendingDoctorId: string;
  wardId: string;
  status: AdmissionStatus;
  admittedAt: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  diagnosis: string;
  metadata: Record<string, unknown>;
}

export interface Transfer {
  id: string;
  admissionId: string;
  patientId: string;
  fromWardId: string;
  toWardId: string;
  requestedBy: string;
  reason: string;
  status: TransferStatus;
  requestedAt: string;
  completedAt?: string;
}

export interface Discharge {
  id: string;
  admissionId: string;
  patientId: string;
  authorizedBy: string;
  status: DischargeStatus;
  dischargeSummary: string;
  instructions: string;
  date: string;
}

export interface PatientMovement {
  id: string;
  admissionId: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  movementTime: string;
  reason: string;
}

export interface OperatingTheatre {
  id: string;
  wardId: string;
  name: string;
  status: RoomStatus;
  capabilities: string[];
}

export interface ProcedureTeam {
  surgeonId: string;
  anesthesiologistId?: string;
  nurses: string[];
  others: string[];
}

export interface ProcedureBooking {
  id: string;
  patientId: string;
  theatreId: string;
  procedureName: string;
  team: ProcedureTeam;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
}

export interface ProcedureSchedule {
  theatreId: string;
  bookings: ProcedureBooking[];
  date: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  currentLocationId: string;
  status: EquipmentStatus;
}

export interface EquipmentReservation {
  id: string;
  equipmentId: string;
  reservedForId: string; // Patient or Procedure ID
  startTime: string;
  endTime: string;
  status: 'Reserved' | 'Active' | 'Completed' | 'Cancelled';
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  assignedToId: string; // Patient, Room, or Ward
  assignedAt: string;
  releasedAt?: string;
}

export interface MaintenanceRequest {
  id: string;
  equipmentId: string;
  reportedBy: string;
  issueDescription: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: MaintenanceStatus;
  createdAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  scheduledDate: string;
  maintenanceType: 'Preventive' | 'Corrective';
  assignedTechnicianId?: string;
  status: MaintenanceStatus;
}

export interface Shift {
  id: string;
  departmentId: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface StaffAssignment {
  id: string;
  staffId: string;
  shiftId: string;
  wardId?: string;
  role: string;
  date: string;
  status: ShiftStatus;
}

export interface Roster {
  id: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  assignments: StaffAssignment[];
}

export interface Department {
  id: string;
  name: string;
  headId: string;
  type: string;
}

export interface NursingStation {
  id: string;
  wardId: string;
  name: string;
  assignedNurses: string[];
}

export interface HousekeepingTask {
  id: string;
  locationId: string; // Room or Ward ID
  taskType: 'Routine' | 'Deep Cleaning' | 'Biohazard';
  assignedTo?: string;
  status: 'Pending' | 'InProgress' | 'Completed';
  createdAt: string;
}

export interface CleaningSchedule {
  id: string;
  locationId: string;
  frequency: string; // e.g., 'Daily', 'Weekly'
  nextScheduledTime: string;
}

export interface BedOccupancy {
  wardId: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
}

export interface WardStatistics {
  wardId: string;
  admissionsToday: number;
  dischargesToday: number;
  transfersIn: number;
  transfersOut: number;
}

export interface OccupancyMetrics {
  timestamp: string;
  hospitalId: string;
  overallOccupancyRate: number;
  wardOccupancy: BedOccupancy[];
}

export interface CapacityMetrics {
  timestamp: string;
  totalCapacity: number;
  currentCensus: number;
  availableCapacity: number;
  surgeCapacity: number;
}

export interface ResourceUtilization {
  timestamp: string;
  equipmentInUseCount: number;
  theatreUtilizationRate: number;
  staffAttendanceRate: number;
}

export interface HospitalDashboard {
  occupancy: OccupancyMetrics;
  capacity: CapacityMetrics;
  utilization: ResourceUtilization;
  recentAdmissions: Admission[];
  pendingDischarges: Discharge[];
}
