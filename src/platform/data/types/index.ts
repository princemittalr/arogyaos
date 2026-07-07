import { z } from 'zod';
import * as Validations from '../utils/validations';

export type MasterRecord = z.infer<typeof Validations.MasterRecordSchema>;
export type Dataset = z.infer<typeof Validations.DatasetSchema>;
export type DataCatalog = z.infer<typeof Validations.DataCatalogSchema>;
export type MetadataCatalog = z.infer<typeof Validations.MetadataCatalogSchema>;
export type SchemaRegistry = z.infer<typeof Validations.SchemaRegistrySchema>;
export type CanonicalModel = z.infer<typeof Validations.CanonicalModelSchema>;
export type TransformationRule = z.infer<typeof Validations.TransformationRuleSchema>;
export type DataPipeline = z.infer<typeof Validations.DataPipelineSchema>;
export type DataQualityRule = z.infer<typeof Validations.DataQualityRuleSchema>;
export type DataLineage = z.infer<typeof Validations.DataLineageSchema>;
export type DataClassification = z.infer<typeof Validations.DataClassificationSchema>;
export type RetentionPolicy = z.infer<typeof Validations.RetentionPolicySchema>;
export type DataRetentionPolicy = RetentionPolicy;
export type AnalyticsModel = z.infer<typeof Validations.AnalyticsModelSchema>;
export type ReportDefinition = z.infer<typeof Validations.ReportDefinitionSchema>;
export type DashboardDefinition = z.infer<typeof Validations.DashboardDefinitionSchema>;
export type DataGovernancePolicy = z.infer<typeof Validations.DataGovernancePolicySchema>;

export interface MasterPatient { id: string; recordId: string; mrn: string; }
export interface MasterProvider { id: string; recordId: string; npi: string; }
export interface MasterOrganization { id: string; recordId: string; taxId: string; }
export interface MasterFacility { id: string; recordId: string; location: string; }
export interface MasterDepartment { id: string; recordId: string; name: string; }
export interface MasterStaff { id: string; recordId: string; employeeId: string; }
export interface MasterDevice { id: string; recordId: string; serialNumber: string; }
export interface MasterMedication { id: string; recordId: string; ndc: string; }
export interface MasterLaboratory { id: string; recordId: string; clia: string; }
export interface MasterProcedure { id: string; recordId: string; cpt: string; }
export interface MasterDiagnosis { id: string; recordId: string; icd10: string; }

export interface ClinicalTerminology { id: string; codeSystem: string; code: string; display: string; }
export interface ReferenceData { id: string; setId: string; value: string; }
export interface ReferenceDataSet { id: string; name: string; }
export interface ReferenceDataVersion { id: string; setId: string; version: string; }

export interface EntityRelationship { id: string; sourceId: string; targetId: string; type: string; }
export interface EntityMerge { id: string; survivorId: string; victimId: string; }
export interface EntityDuplicate { id: string; entity1Id: string; entity2Id: string; score: number; }

export interface DatasetVersion { id: string; datasetId: string; version: string; }
export interface DatasetProfile { id: string; datasetId: string; rowCount: number; }
export interface DataMapping { id: string; sourceId: string; targetId: string; rules: string[]; }
export interface PipelineDefinition { id: string; pipelineId: string; steps: string[]; }
export interface PipelineSchedule { id: string; pipelineId: string; cron: string; }

export interface DataQualityResult { id: string; ruleId: string; score: number; passed: boolean; }
export interface DataSteward { id: string; userId: string; domain: string; }
export interface DataOwner { id: string; userId: string; datasetId: string; }
export interface DataLifecycle { id: string; entityId: string; state: string; }
export interface ArchivePolicy { id: string; datasetId: string; destination: string; }
export interface SemanticModel { id: string; name: string; relationships: string[]; }
export interface MetricDefinition { id: string; name: string; category: string; formula: string; }
export interface KPIRegistry { id: string; metricId: string; target: number; }
export interface DataAudit { id: string; action: string; timestamp: string; actor: string; }
export interface DataVersion { id: string; entityId: string; versionHash: string; }
export interface DataProvenance { id: string; entityId: string; sourceSystem: string; }
