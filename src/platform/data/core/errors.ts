export class MasterRecordNotFoundError extends Error {
  constructor(message: string) { super(message); this.name = 'MasterRecordNotFoundError'; }
}
export class DuplicateEntityError extends Error {
  constructor(message: string) { super(message); this.name = 'DuplicateEntityError'; }
}
export class DatasetValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'DatasetValidationError'; }
}
export class DataQualityError extends Error {
  constructor(message: string) { super(message); this.name = 'DataQualityError'; }
}
export class SchemaRegistryError extends Error {
  constructor(message: string) { super(message); this.name = 'SchemaRegistryError'; }
}
export class TransformationRuleError extends Error {
  constructor(message: string) { super(message); this.name = 'TransformationRuleError'; }
}
export class PipelineDefinitionError extends Error {
  constructor(message: string) { super(message); this.name = 'PipelineDefinitionError'; }
}
export class DataGovernanceError extends Error {
  constructor(message: string) { super(message); this.name = 'DataGovernanceError'; }
}
export class LineageValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'LineageValidationError'; }
}
export class RetentionPolicyError extends Error {
  constructor(message: string) { super(message); this.name = 'RetentionPolicyError'; }
}
