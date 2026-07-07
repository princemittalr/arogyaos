export type DeviceCategory = 'Wearable' | 'PointOfCare' | 'Implantable' | 'Gateway' | 'Environmental';
export type DeviceType = 'ECG' | 'PulseOximeter' | 'BloodPressure' | 'Thermometer' | 'Glucometer' | 'Spirometer' | 'WeightScale' | 'MultiParameter';
export type DeviceStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Decommissioned' | 'Quarantined';
export type ConnectivityType = 'Bluetooth' | 'WiFi' | 'USB' | 'Serial' | 'Cellular' | 'Zigbee';
export type MonitoringMode = 'Continuous' | 'SpotCheck' | 'EventDriven' | 'Periodic';
export type ObservationType = 'HeartRate' | 'SpO2' | 'BloodPressureSystolic' | 'BloodPressureDiastolic' | 'Temperature' | 'Glucose' | 'Weight' | 'RespiratoryRate';
export type ObservationQuality = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Invalid';
export type AlertSeverity = 'Info' | 'Warning' | 'Critical' | 'LifeThreatening';
export type CalibrationStatus = 'Valid' | 'Expired' | 'Pending' | 'Failed';
export type FirmwareStatus = 'UpToDate' | 'UpdateAvailable' | 'Updating' | 'Failed';
export type SynchronizationStatus = 'Pending' | 'InProgress' | 'Completed' | 'Failed';

export interface DeviceCapability {
  capabilityId: string;
  name: string;
  supportedObservations: ObservationType[];
  supportedModes: MonitoringMode[];
}

export interface MedicalDevice {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: DeviceCategory;
  type: DeviceType;
  status: DeviceStatus;
  capabilities: DeviceCapability[];
}

export interface DeviceRegistration {
  id: string;
  deviceId: string;
  registeredAt: string;
  registeredBy: string;
  facilityId: string;
}

export interface DeviceAssignment {
  id: string;
  deviceId: string;
  patientId: string;
  assignedAt: string;
  assignedBy: string;
  expectedReturnDate?: string;
}

export interface DeviceConfiguration {
  deviceId: string;
  monitoringMode: MonitoringMode;
  reportingIntervalSeconds: number;
  parameters: Record<string, unknown>;
}

export interface CalibrationRecord {
  id: string;
  performedAt: string;
  performedBy: string;
  nextDueDate: string;
  result: 'Pass' | 'Fail';
  notes?: string;
}

export interface DeviceCalibration {
  deviceId: string;
  status: CalibrationStatus;
  lastCalibration: CalibrationRecord;
}

export interface DeviceHealth {
  deviceId: string;
  batteryLevel: number;
  signalStrength: number;
  lastSeenAt: string;
}

export interface FirmwareVersion {
  version: string;
  releaseDate: string;
  isMandatory: boolean;
}

export interface FirmwareUpdate {
  id: string;
  deviceId: string;
  targetVersion: FirmwareVersion;
  status: FirmwareStatus;
  startedAt: string;
  completedAt?: string;
}

export interface DeviceConnectivity {
  deviceId: string;
  primaryType: ConnectivityType;
  isConnected: boolean;
  lastConnectedAt: string;
}

export interface BluetoothConnection extends DeviceConnectivity {
  macAddress: string;
}

export interface WifiConnection extends DeviceConnectivity {
  ipAddress: string;
  ssid: string;
}

export interface UsbConnection extends DeviceConnectivity {
  port: string;
}

export interface SerialConnection extends DeviceConnectivity {
  baudRate: number;
}

export interface GatewayConnection extends DeviceConnectivity {
  gatewayId: string;
}

export interface MonitoringSession {
  id: string;
  deviceId: string;
  patientId: string;
  mode: MonitoringMode;
  startedAt: string;
  endedAt?: string;
}

export interface DeviceSession {
  sessionId: string;
  monitoringSession: MonitoringSession;
}

export interface ObservationConfidence {
  score: number;
  quality: ObservationQuality;
}

export interface ObservationMetadata {
  deviceId: string;
  sessionId: string;
  recordedAt: string;
  receivedAt: string;
}

export interface Observation {
  id: string;
  type: ObservationType;
  value: number;
  unit: string;
  confidence: ObservationConfidence;
  metadata: ObservationMetadata;
}

export interface ObservationSeries {
  id: string;
  type: ObservationType;
  observations: Observation[];
  startTime: string;
  endTime: string;
}

export interface VitalSign {
  id: string;
  patientId: string;
  observation: Observation;
}

export interface VitalTrend {
  patientId: string;
  type: ObservationType;
  series: ObservationSeries;
}

export interface AlertThreshold {
  type: ObservationType;
  minValue?: number;
  maxValue?: number;
  durationSeconds?: number;
}

export interface AlertRule {
  id: string;
  name: string;
  thresholds: AlertThreshold[];
  severity: AlertSeverity;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  patientId: string;
  deviceId: string;
  severity: AlertSeverity;
  triggeredAt: string;
  resolvedAt?: string;
  triggeringObservationId: string;
}

export interface RemoteMonitoringPlan {
  id: string;
  patientId: string;
  prescribedDevices: DeviceType[];
  alertRules: AlertRule[];
  startDate: string;
  endDate?: string;
}

export interface PatientMonitoringAssignment {
  id: string;
  planId: string;
  deviceAssignments: DeviceAssignment[];
}

export interface WearableDevice extends MedicalDevice {
  batteryLifeDays: number;
}

export interface ECGDevice extends MedicalDevice {
  leadCount: number;
}

export interface PulseOximeter extends MedicalDevice {
  supportsPerfusionIndex: boolean;
}

export interface BloodPressureMonitor extends MedicalDevice {
  cuffSize: string;
}

export interface Thermometer extends MedicalDevice {
  measurementSite: string;
}

export interface Glucometer extends MedicalDevice {
  stripType: string;
}

export interface Spirometer extends MedicalDevice {
  calibrationRequiredBeforeUse: boolean;
}

export interface WeightScale extends MedicalDevice {
  maxWeightKg: number;
}

export interface MedicalGateway extends MedicalDevice {
  supportedProtocols: string[];
  maxConnectedDevices: number;
}

export interface DataSynchronization {
  id: string;
  deviceId: string;
  status: SynchronizationStatus;
  recordCount: number;
  startedAt: string;
  completedAt?: string;
}

export interface DeviceAudit {
  id: string;
  deviceId: string;
  action: string;
  actorId: string;
  timestamp: string;
  details: Record<string, unknown>;
}
