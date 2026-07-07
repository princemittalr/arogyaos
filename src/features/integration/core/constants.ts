export const API_TYPES = [
  'REST',
  'GraphQL',
  'gRPC',
  'WebSocket',
  'AsyncAPI'
] as const;

export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD'
] as const;

export const AUTH_METADATA_TYPES = [
  'APIKey',
  'OAuth2',
  'OIDC',
  'JWT',
  'MutualTLS'
] as const;

export const INTEGRATION_TYPES = [
  'Inbound',
  'Outbound',
  'Bidirectional'
] as const;

export const CONNECTOR_TYPES = [
  'EHR',
  'LIS',
  'PACS',
  'Payment',
  'Identity',
  'Custom'
] as const;

export const EVENT_TYPES = [
  'System',
  'Domain',
  'Custom'
] as const;

export const WEBHOOK_STATUSES = [
  'Active',
  'Suspended',
  'Failing'
] as const;

export const WORKFLOW_STATUSES = [
  'Draft',
  'Published',
  'Archived'
] as const;

export const SDK_LANGUAGES = [
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'CSharp',
  'Ruby'
] as const;

export const RATE_LIMIT_TYPES = [
  'Global',
  'PerUser',
  'PerTenant',
  'PerIP'
] as const;

export const QUOTA_TYPES = [
  'Daily',
  'Monthly',
  'Annual'
] as const;

export const TRANSFORMATION_TYPES = [
  'Jq',
  'Jsonata',
  'Mapping',
  'CustomScript'
] as const;

export const SYNC_STATES = [
  'Pending',
  'Running',
  'Completed',
  'Failed'
] as const;

export const HEALTH_STATES = [
  'Healthy',
  'Degraded',
  'Critical',
  'Offline'
] as const;
