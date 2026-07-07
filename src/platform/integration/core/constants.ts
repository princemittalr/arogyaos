export const WORKFLOW_TYPES = [
  'Sequential',
  'Parallel',
  'Conditional',
  'Saga'
] as const;

export const TRIGGER_TYPES = [
  'Manual',
  'Event',
  'Schedule',
  'API'
] as const;

export const CONDITION_TYPES = [
  'Expression',
  'StateCheck',
  'DataValidation'
] as const;

export const EXECUTION_STATES = [
  'Pending',
  'Running',
  'Suspended',
  'Completed',
  'Failed',
  'Cancelled'
] as const;

export const WORKFLOW_STATUS = [
  'Active',
  'Inactive',
  'Draft',
  'Deprecated'
] as const;

export const INTEGRATION_TYPES = [
  'Synchronous',
  'Asynchronous',
  'FireAndForget'
] as const;

export const PRIORITY_LEVELS = [
  'Critical',
  'High',
  'Normal',
  'Low'
] as const;

export const RETRY_POLICIES = [
  'None',
  'ExponentialBackoff',
  'FixedInterval'
] as const;

export const EVENT_CATEGORIES = [
  'System',
  'Domain',
  'Integration',
  'Audit'
] as const;
