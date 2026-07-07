export const DEVICE_CATEGORIES = [
  'Wearable',
  'PointOfCare',
  'Implantable',
  'Gateway',
  'Environmental'
] as const;

export const DEVICE_TYPES = [
  'ECG',
  'PulseOximeter',
  'BloodPressure',
  'Thermometer',
  'Glucometer',
  'Spirometer',
  'WeightScale',
  'MultiParameter'
] as const;

export const DEVICE_STATUSES = [
  'Active',
  'Inactive',
  'Maintenance',
  'Decommissioned',
  'Quarantined'
] as const;

export const CONNECTIVITY_TYPES = [
  'Bluetooth',
  'WiFi',
  'USB',
  'Serial',
  'Cellular',
  'Zigbee'
] as const;

export const MONITORING_MODES = [
  'Continuous',
  'SpotCheck',
  'EventDriven',
  'Periodic'
] as const;

export const OBSERVATION_TYPES = [
  'HeartRate',
  'SpO2',
  'BloodPressureSystolic',
  'BloodPressureDiastolic',
  'Temperature',
  'Glucose',
  'Weight',
  'RespiratoryRate'
] as const;

export const OBSERVATION_QUALITIES = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Invalid'
] as const;

export const ALERT_SEVERITIES = [
  'Info',
  'Warning',
  'Critical',
  'LifeThreatening'
] as const;

export const CALIBRATION_STATUSES = [
  'Valid',
  'Expired',
  'Pending',
  'Failed'
] as const;

export const FIRMWARE_STATUSES = [
  'UpToDate',
  'UpdateAvailable',
  'Updating',
  'Failed'
] as const;

export const SYNCHRONIZATION_STATUSES = [
  'Pending',
  'InProgress',
  'Completed',
  'Failed'
] as const;

export const SUPPORTED_FILTERS = [
  'status',
  'category',
  'type',
  'connectivity'
] as const;

export const SEARCH_FIELDS = [
  'deviceId',
  'patientId',
  'serialNumber'
] as const;
