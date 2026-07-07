import { z } from 'zod';
import {
  ENVIRONMENT_TYPES,
  DEPLOYMENT_STATUSES,
  DEPLOYMENT_STRATEGIES,
  PIPELINE_STATUSES,
  FEATURE_FLAG_STATUSES,
  CONFIGURATION_STATUSES,
  SERVICE_STATUSES,
  HEALTH_STATUSES,
  ALERT_SEVERITIES,
  INCIDENT_STATUSES,
  BACKUP_STATUSES,
  RECOVERY_STATUSES
} from '../core/constants';

export const EnvironmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(ENVIRONMENT_TYPES),
  clusterId: z.string().uuid().optional(),
  description: z.string().optional()
});

export const DeploymentSchema = z.object({
  id: z.string().uuid(),
  environmentId: z.string().uuid(),
  version: z.string(),
  status: z.enum(DEPLOYMENT_STATUSES),
  strategy: z.enum(DEPLOYMENT_STRATEGIES),
  triggeredBy: z.string().uuid(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional()
});

export const ReleaseSchema = z.object({
  id: z.string().uuid(),
  version: z.string(),
  name: z.string(),
  description: z.string().optional(),
  deploymentIds: z.array(z.string().uuid()),
  publishedAt: z.string().datetime()
});

export const PipelineSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(PIPELINE_STATUSES),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional()
});

export const FeatureFlagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  key: z.string(),
  status: z.enum(FEATURE_FLAG_STATUSES),
  rules: z.array(z.record(z.string(), z.unknown()))
});

export const ConfigurationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(CONFIGURATION_STATUSES),
  data: z.record(z.string(), z.unknown()),
  version: z.string()
});

export const ServiceDefinitionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(SERVICE_STATUSES),
  repositoryUrl: z.string().url().optional(),
  ownerId: z.string().uuid()
});

export const HealthCheckSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid(),
  status: z.enum(HEALTH_STATUSES),
  latencyMs: z.number().min(0),
  lastCheckedAt: z.string().datetime()
});

export const AlertPolicySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  severity: z.enum(ALERT_SEVERITIES),
  conditions: z.array(z.record(z.string(), z.unknown())),
  channels: z.array(z.string())
});

export const IncidentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.enum(INCIDENT_STATUSES),
  severity: z.enum(ALERT_SEVERITIES),
  openedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional()
});

export const BackupPolicySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(BACKUP_STATUSES).optional(),
  schedule: z.string(),
  retentionDays: z.number().positive()
});

export const RecoveryPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(RECOVERY_STATUSES),
  steps: z.array(z.string())
});

export const OperationsAuditSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  actorId: z.string().uuid(),
  timestamp: z.string().datetime(),
  resourceId: z.string().uuid().optional(),
  resourceType: z.string().optional()
});

export const OperationsMetricSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  timestamp: z.string().datetime(),
  tags: z.record(z.string(), z.string()).optional()
});
