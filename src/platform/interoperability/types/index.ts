export type FHIRVersion = 'STU3' | 'R4' | 'R5';
export type HL7Version = 'V2.3' | 'V2.5' | 'V2.7' | 'V3';
export type CDAVersion = 'R2' | 'R3';
export type DICOMVersion = '3.0';
export type TerminologyStandard = 'ICD-10' | 'SNOMED-CT' | 'LOINC' | 'RxNorm' | 'UCUM';
export type ExchangeProtocol = 'REST' | 'SOAP' | 'MLLP' | 'SFTP';
export type ValidationMode = 'STRICT' | 'LENIENT' | 'WARNING_ONLY';
export type SynchronizationMode = 'REALTIME' | 'BATCH' | 'SCHEDULED' | 'MANUAL';

export interface FHIRServer { id: string; name: string; url: string; version: FHIRVersion; }
export interface FHIRResource { id: string; serverId: string; resourceType: string; profileId?: string; }
export interface FHIRProfile { id: string; url: string; name: string; version: FHIRVersion; }
export interface FHIRBundle { id: string; type: string; resources: string[]; }
export interface FHIREndpoint { id: string; url: string; capabilities: string[]; }
export interface FHIRCapabilityStatement { id: string; serverId: string; statement: string; }
export interface FHIRSubscription { id: string; endpointId: string; criteria: string; }
export interface FHIRTerminology { id: string; serverId: string; url: string; }
export interface FHIRValueSet { id: string; terminologyId: string; url: string; }
export interface FHIRCodeSystem { id: string; terminologyId: string; url: string; }
export interface FHIRStructureDefinition { id: string; profileId: string; url: string; }
export interface FHIRImplementationGuide { id: string; url: string; name: string; }

export interface HL7Message { id: string; type: string; version: HL7Version; }
export interface HL7Segment { id: string; messageId: string; code: string; }
export interface HL7TriggerEvent { id: string; messageId: string; event: string; }
export interface HL7Profile { id: string; name: string; version: HL7Version; }
export interface HL7Mapping { id: string; profileId: string; rules: string[]; }

export interface CDADocument { id: string; type: string; version: CDAVersion; }
export interface CCDDocument { id: string; documentId: string; sections: string[]; }
export interface ClinicalDocument { id: string; type: string; authorId: string; }

export interface DICOMStudy { id: string; studyInstanceUid: string; version: DICOMVersion; }
export interface DICOMSeries { id: string; studyId: string; seriesInstanceUid: string; }
export interface DICOMInstance { id: string; seriesId: string; sopInstanceUid: string; }
export interface ImagingManifest { id: string; studyId: string; url: string; }

export interface MasterPatientIndex { id: string; systemId: string; patients: string[]; }
export interface PatientIdentity { id: string; indexId: string; mrn: string; }
export interface PatientIdentifier { id: string; identityId: string; system: string; value: string; }
export interface PatientMerge { id: string; sourceIdentityId: string; targetIdentityId: string; }

export interface ProviderRegistry { id: string; name: string; url: string; }
export interface PractitionerDirectory { id: string; registryId: string; practitioners: string[]; }
export interface OrganizationRegistry { id: string; name: string; url: string; }
export interface FacilityRegistry { id: string; name: string; url: string; }

export interface TerminologyService { id: string; url: string; standard: TerminologyStandard; }
export interface ICD10Mapping { id: string; serviceId: string; code: string; }
export interface SNOMEDMapping { id: string; serviceId: string; code: string; }
export interface LOINCMapping { id: string; serviceId: string; code: string; }
export interface RxNormMapping { id: string; serviceId: string; code: string; }
export interface UCUMMapping { id: string; serviceId: string; code: string; }

export interface DataExchangePolicy { id: string; name: string; protocol: ExchangeProtocol; }
export interface DataSharingAgreement { id: string; policyId: string; parties: string[]; }
export interface ConsentExchangeRule { id: string; agreementId: string; rules: string[]; }

export interface DataTransformation { id: string; name: string; type: string; }
export interface TransformationRule { id: string; transformationId: string; logic: string; }
export interface MappingProfile { id: string; source: string; target: string; }

export interface SynchronizationProfile { id: string; mode: SynchronizationMode; targetId: string; }
export interface SynchronizationJob { id: string; profileId: string; status: string; }
export interface ImportProfile { id: string; sourceSystem: string; targetSystem: string; }
export interface ExportProfile { id: string; sourceSystem: string; targetSystem: string; }

export interface ValidationProfile { id: string; mode: ValidationMode; rules: string[]; }
export interface ValidationRule { id: string; profileId: string; rule: string; }

export interface InteroperabilityAudit { id: string; transactionId: string; status: string; }
export interface ExchangeTransaction { id: string; sourceId: string; targetId: string; }
export interface ExchangeEndpoint { id: string; url: string; protocol: ExchangeProtocol; }
export interface ExchangeQueue { id: string; endpointId: string; messages: string[]; }

export interface PartnerOrganization { id: string; name: string; identifier: string; }
export interface ExternalSystem { id: string; partnerId: string; systemType: string; }
export interface IntegrationCertificate { id: string; systemId: string; thumbprint: string; }
export interface TrustConfiguration { id: string; systemId: string; policies: string[]; }
