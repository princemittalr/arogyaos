export class EnvironmentNotFoundError extends Error {
  constructor(message: string) { super(message); this.name = 'EnvironmentNotFoundError'; }
}
export class DeploymentValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'DeploymentValidationError'; }
}
export class PipelineConfigurationError extends Error {
  constructor(message: string) { super(message); this.name = 'PipelineConfigurationError'; }
}
export class ReleaseValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'ReleaseValidationError'; }
}
export class FeatureFlagError extends Error {
  constructor(message: string) { super(message); this.name = 'FeatureFlagError'; }
}
export class ConfigurationConflictError extends Error {
  constructor(message: string) { super(message); this.name = 'ConfigurationConflictError'; }
}
export class ServiceRegistryError extends Error {
  constructor(message: string) { super(message); this.name = 'ServiceRegistryError'; }
}
export class HealthCheckError extends Error {
  constructor(message: string) { super(message); this.name = 'HealthCheckError'; }
}
export class AlertConfigurationError extends Error {
  constructor(message: string) { super(message); this.name = 'AlertConfigurationError'; }
}
export class IncidentManagementError extends Error {
  constructor(message: string) { super(message); this.name = 'IncidentManagementError'; }
}
export class BackupPolicyError extends Error {
  constructor(message: string) { super(message); this.name = 'BackupPolicyError'; }
}
export class RecoveryPlanError extends Error {
  constructor(message: string) { super(message); this.name = 'RecoveryPlanError'; }
}
