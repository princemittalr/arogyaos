import { z } from 'zod';
import {
  MASTER_ENTITY_TYPES,
  DATASET_TYPES,
  PIPELINE_STATUSES,
  DATA_QUALITY_STATUSES,
  CLASSIFICATION_LEVELS,
  RETENTION_STATUSES,
  GOVERNANCE_STATUSES
} from '../core/constants';

export const MasterRecordSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(MASTER_ENTITY_TYPES),
  canonicalId: z.string(),
  attributes: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const DatasetSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(DATASET_TYPES),
  ownerId: z.string().uuid(),
  schemaId: z.string().uuid().optional(),
  createdAt: z.string().datetime()
});

export const DataCatalogSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  datasets: z.array(z.string().uuid())
});

export const MetadataCatalogSchema = z.object({
  id: z.string().uuid(),
  datasetId: z.string().uuid(),
  tags: z.array(z.string()),
  description: z.string()
});

export const SchemaRegistrySchema = z.object({
  id: z.string().uuid(),
  version: z.string(),
  definition: z.record(z.string(), z.unknown())
});

export const CanonicalModelSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(MASTER_ENTITY_TYPES),
  version: z.string(),
  attributes: z.array(z.string())
});

export const TransformationRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sourceField: z.string(),
  targetField: z.string(),
  expression: z.string()
});

export const DataPipelineSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(PIPELINE_STATUSES),
  schedule: z.string().optional()
});

export const DataQualityRuleSchema = z.object({
  id: z.string().uuid(),
  datasetId: z.string().uuid(),
  ruleType: z.string(),
  threshold: z.number(),
  status: z.enum(DATA_QUALITY_STATUSES).optional()
});

export const DataLineageSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  transformationId: z.string().uuid().optional()
});

export const DataClassificationSchema = z.object({
  id: z.string().uuid(),
  datasetId: z.string().uuid(),
  level: z.enum(CLASSIFICATION_LEVELS),
  reason: z.string()
});

export const RetentionPolicySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  durationDays: z.number().positive(),
  status: z.enum(RETENTION_STATUSES)
});

export const AnalyticsModelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  datasetIds: z.array(z.string().uuid()),
  queryDefinition: z.string()
});

export const ReportDefinitionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  modelId: z.string().uuid(),
  layout: z.record(z.string(), z.unknown())
});

export const DashboardDefinitionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  reports: z.array(z.string().uuid())
});

export const DataGovernancePolicySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(GOVERNANCE_STATUSES),
  rules: z.array(z.string())
});
