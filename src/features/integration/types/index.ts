export type APIType = 'REST' | 'GraphQL' | 'gRPC' | 'WebSocket' | 'AsyncAPI';
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
export type AuthMetadataType = 'APIKey' | 'OAuth2' | 'OIDC' | 'JWT' | 'MutualTLS';
export type IntegrationType = 'Inbound' | 'Outbound' | 'Bidirectional';
export type ConnectorType = 'EHR' | 'LIS' | 'PACS' | 'Payment' | 'Identity' | 'Custom';
export type EventType = 'System' | 'Domain' | 'Custom';
export type WebhookStatus = 'Active' | 'Suspended' | 'Failing';
export type WorkflowStatus = 'Draft' | 'Published' | 'Archived';
export type SDKLanguage = 'TypeScript' | 'Python' | 'Java' | 'Go' | 'CSharp' | 'Ruby';
export type RateLimitType = 'Global' | 'PerUser' | 'PerTenant' | 'PerIP';
export type QuotaType = 'Daily' | 'Monthly' | 'Annual';
export type TransformationType = 'Jq' | 'Jsonata' | 'Mapping' | 'CustomScript';
export type SyncState = 'Pending' | 'Running' | 'Completed' | 'Failed';
export type HealthState = 'Healthy' | 'Degraded' | 'Critical' | 'Offline';

export interface API {
  id: string;
  name: string;
  description: string;
  type: APIType;
  status: 'Draft' | 'Active' | 'Deprecated' | 'Retired';
  createdAt: string;
}

export interface APIVersion {
  id: string;
  apiId: string;
  version: string;
  lifecycle: 'Alpha' | 'Beta' | 'GA' | 'Deprecated';
  publishedAt: string;
}

export interface APIProduct {
  id: string;
  name: string;
  apis: string[];
  status: 'Active' | 'Inactive';
}

export interface APIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required: boolean;
  schema: string;
}

export interface APIHeader {
  name: string;
  description: string;
  required: boolean;
}

export interface APIRequest {
  contentType: string;
  schema: string;
}

export interface APIResponse {
  statusCode: number;
  contentType: string;
  schema: string;
}

export interface APIEndpoint {
  id: string;
  versionId: string;
  path: string;
  method: HTTPMethod;
}

export interface APIOperation {
  id: string;
  endpointId: string;
  operationId: string;
  parameters: APIParameter[];
  requestBody?: APIRequest;
  responses: APIResponse[];
}

export interface RateLimit {
  id: string;
  type: RateLimitType;
  requests: number;
  windowSeconds: number;
}

export interface Quota {
  id: string;
  type: QuotaType;
  limit: number;
}

export interface APIKeyMetadata {
  id: string;
  developerId: string;
  applicationId: string;
  scopes: string[];
  status: 'Active' | 'Revoked';
}

export interface OAuthClientMetadata {
  clientId: string;
  applicationId: string;
  grantTypes: string[];
  redirectUris: string[];
}

export interface Developer {
  id: string;
  userId: string;
  status: 'Active' | 'Suspended';
}

export interface DeveloperOrganization {
  id: string;
  name: string;
  developers: string[];
}

export interface DeveloperApplication {
  id: string;
  developerId: string;
  name: string;
  description: string;
  status: 'Active' | 'Suspended';
}

export interface DeveloperPortal {
  id: string;
  tenantId: string;
  branding: Record<string, unknown>;
}

export interface SDKPackage {
  language: SDKLanguage;
  packageManager: string;
  packageName: string;
}

export interface SDKVersion {
  version: string;
  apiId: string;
  apiVersionId: string;
  publishedAt: string;
}

export interface SDK {
  id: string;
  apiId: string;
  packages: SDKPackage[];
}

export interface IntegrationConnector {
  id: string;
  type: ConnectorType;
  name: string;
  version: string;
  vendor: string;
}

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  connectorId: string;
  tenantId: string;
  status: 'Active' | 'Inactive';
}

export interface TransformationRule {
  id: string;
  integrationId: string;
  type: TransformationType;
  sourcePath: string;
  targetPath: string;
  expression: string;
}

export interface IntegrationMapping {
  id: string;
  integrationId: string;
  rules: string[];
}

export interface SchemaDefinition {
  id: string;
  name: string;
  version: string;
  content: string;
  format: 'JSONSchema' | 'Avro' | 'Protobuf';
}

export interface SchemaRegistry {
  id: string;
  tenantId: string;
  schemas: string[];
}

export interface DataContract {
  id: string;
  providerId: string;
  consumerId: string;
  schemaId: string;
  status: 'Active' | 'Deprecated';
}

export interface Webhook {
  id: string;
  applicationId: string;
  url: string;
  status: WebhookStatus;
  secretMetadataId: string;
}

export interface WebhookSubscription {
  id: string;
  webhookId: string;
  events: string[];
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  status: 'Success' | 'Failed';
  timestamp: string;
}

export interface EventTopic {
  id: string;
  name: string;
  type: EventType;
}

export interface Event {
  id: string;
  topicId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface EventSubscription {
  id: string;
  topicId: string;
  subscriberId: string;
}

export interface DeadLetterEvent {
  id: string;
  eventId: string;
  reason: string;
  timestamp: string;
}

export interface EventReplay {
  id: string;
  subscriptionId: string;
  startTime: string;
  endTime: string;
  status: SyncState;
}

export interface WorkflowStep {
  id: string;
  name: string;
  actionType: string;
  nextStepId?: string;
}

export interface Workflow {
  id: string;
  name: string;
  tenantId: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: SyncState;
  startedAt: string;
  completedAt?: string;
}

export interface SynchronizationJob {
  id: string;
  integrationId: string;
  status: SyncState;
  startedAt: string;
  completedAt?: string;
  recordsProcessed: number;
}

export interface ConnectorHealth {
  connectorId: string;
  status: HealthState;
  lastCheckedAt: string;
  latencyMs: number;
}

export interface IntegrationAudit {
  id: string;
  action: string;
  integrationId: string;
  actorId: string;
  timestamp: string;
}
