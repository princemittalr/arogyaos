import { z } from 'zod';
import * as Validations from '../utils/validations';

export type Environment = z.infer<typeof Validations.EnvironmentSchema>;
export interface EnvironmentVariable { id: string; key: string; value: string; isSecret: boolean; }
export interface EnvironmentGroup { id: string; name: string; environmentIds: string[]; }

export type Deployment = z.infer<typeof Validations.DeploymentSchema>;
export interface DeploymentStrategy { type: string; config: Record<string, unknown>; }
export interface DeploymentVersion { versionId: string; commitHash: string; tag: string; }
export interface DeploymentArtifact { id: string; type: string; url: string; hash: string; }

export type Release = z.infer<typeof Validations.ReleaseSchema>;
export interface ReleasePlan { id: string; steps: string[]; }
export interface ReleasePipeline { id: string; stages: string[]; }

export interface PipelineStage { id: string; name: string; order: number; }
export interface PipelineStep { id: string; stageId: string; command: string; }
export interface PipelineVariable { key: string; value: string; }
export interface PipelineTemplate { id: string; name: string; yaml: string; }
export interface PipelineExecution { id: string; pipelineId: string; status: string; }

export type FeatureFlag = z.infer<typeof Validations.FeatureFlagSchema>;
export interface FeatureFlagRule { id: string; flagId: string; condition: string; }
export interface FeatureFlagTarget { id: string; ruleId: string; userId: string; }

export interface ConfigurationProfile { id: string; name: string; }
export interface ConfigurationItem { key: string; value: string; }
export interface ConfigurationVersion { version: string; items: ConfigurationItem[]; }
export interface ConfigurationSnapshot { id: string; timestamp: string; }

export interface ServiceRegistry { id: string; services: string[]; }
export type ServiceDefinition = z.infer<typeof Validations.ServiceDefinitionSchema>;
export interface ServiceDependency { sourceId: string; targetId: string; type: string; }

export interface APIGateway { id: string; name: string; url: string; }
export interface APIRoute { id: string; path: string; targetUrl: string; }
export interface APIPolicy { id: string; rules: string[]; }

export type HealthCheck = z.infer<typeof Validations.HealthCheckSchema>;
export interface HealthStatus { isHealthy: boolean; lastChecked: string; }
export interface MonitoringConfiguration { enabled: boolean; endpoint: string; }
export interface MetricDefinition { name: string; type: string; }

export interface LogConfiguration { level: string; format: string; destination: string; }
export interface TracingConfiguration { enabled: boolean; samplerate: number; }

export type AlertPolicy = z.infer<typeof Validations.AlertPolicySchema>;
export interface AlertRule { condition: string; threshold: number; }
export interface AlertChannel { type: string; target: string; }

export type Incident = z.infer<typeof Validations.IncidentSchema>;
export interface IncidentSeverity { level: string; description: string; }
export interface IncidentTimeline { eventId: string; timestamp: string; description: string; }

export interface MaintenanceWindow { startTime: string; endTime: string; reason: string; }
export interface Runbook { id: string; title: string; content: string; }

export type BackupPolicy = z.infer<typeof Validations.BackupPolicySchema>;
export interface BackupSchedule { cron: string; retention: number; }
export type RestorePlan = z.infer<typeof Validations.RecoveryPlanSchema>;
export interface DisasterRecoveryPlan { id: string; steps: string[]; }
export interface RecoveryObjective { rtoMs: number; rpoMs: number; }

export interface InfrastructureResource { id: string; type: string; provider: string; }
export interface Cluster { id: string; name: string; region: string; }
export interface NodePool { id: string; clusterId: string; nodeCount: number; instanceType: string; }
export interface ContainerDefinition { image: string; tag: string; ports: number[]; }

export interface SecretReference { key: string; vaultPath: string; }
export interface CertificateMetadata { domain: string; expirationDate: string; issuer: string; }

export interface CapacityPlan { requiredNodes: number; reservedCapacity: number; }
export interface ScalingPolicy { min: number; max: number; metric: string; target: number; }

export interface CostCenter { id: string; name: string; budget: number; }
export interface CostAllocation { resourceId: string; costCenterId: string; percentage: number; }
export interface BudgetPolicy { maxMonthlySpend: number; alertThresholds: number[]; }

export type OperationsAudit = z.infer<typeof Validations.OperationsAuditSchema>;
export type OperationsMetric = z.infer<typeof Validations.OperationsMetricSchema>;
export interface OperationsDashboard { id: string; panels: Record<string, unknown>[]; }

// Allow missing PipelineSchema and ConfigurationSchema from Zod inference manually mapping:
export type Pipeline = z.infer<typeof Validations.PipelineSchema>;
export type Configuration = z.infer<typeof Validations.ConfigurationSchema>;
