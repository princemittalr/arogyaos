export type SecurityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type PermissionLevel = 'READ' | 'WRITE' | 'DELETE' | 'ADMIN' | 'EXECUTE';
export type ConsentStatus = 'GRANTED' | 'REVOKED' | 'EXPIRED' | 'PENDING';
export type PrivacyCategory = 'PHI' | 'PII' | 'FINANCIAL' | 'PUBLIC';
export type ClassificationLevel = 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
export type EncryptionAlgorithm = 'AES_256_GCM' | 'RSA_4096' | 'CHACHA20_POLY1305' | 'ECC_P384';
export type ComplianceFrameworkType = 'HIPAA' | 'GDPR' | 'SOC2' | 'ISO27001' | 'HITRUST';
export type RiskLevel = 'NEGLIGIBLE' | 'MINOR' | 'SIGNIFICANT' | 'SEVERE';
export type ThreatCategory = 'MALWARE' | 'PHISHING' | 'INSIDER' | 'DDOS' | 'EXFILTRATION';
export type IncidentSeverity = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
export type RetentionPolicyType = 'EPHEMERAL' | 'SHORT_TERM' | 'LONG_TERM' | 'INDEFINITE';

export interface SecurityPolicy {
  id: string;
  name: string;
  level: SecurityLevel;
  rules: string[];
}

export interface AccessPolicy {
  id: string;
  resourceId: string;
  allowedRoles: string[];
}

export interface PermissionMatrix {
  id: string;
  roleId: string;
  permissions: PermissionLevel[];
}

export interface RolePolicy {
  id: string;
  roleName: string;
  matrixId: string;
}

export interface Consent {
  id: string;
  userId: string;
  templateId: string;
  status: ConsentStatus;
  grantedAt: string;
}

export interface ConsentRecord {
  id: string;
  consentId: string;
  action: string;
  timestamp: string;
}

export interface ConsentTemplate {
  id: string;
  title: string;
  body: string;
  version: string;
}

export interface PrivacyPolicy {
  id: string;
  name: string;
  category: PrivacyCategory;
}

export interface PrivacyRule {
  id: string;
  policyId: string;
  action: string;
  constraint: string;
}

export interface DataClassification {
  id: string;
  dataId: string;
  level: ClassificationLevel;
}

export interface DataSensitivity {
  id: string;
  classificationId: string;
  isSensitive: boolean;
}

export interface EncryptionPolicy {
  id: string;
  algorithm: EncryptionAlgorithm;
  enforceRotation: boolean;
}

export interface EncryptionKeyMetadata {
  id: string;
  policyId: string;
  keyId: string;
  status: 'ACTIVE' | 'ROTATED' | 'COMPROMISED';
}

export interface KeyRotationPolicy {
  id: string;
  intervalDays: number;
}

export interface SecretsMetadata {
  id: string;
  secretPath: string;
  rotationPolicyId: string;
}

export interface CredentialMetadata {
  id: string;
  userId: string;
  credentialType: string;
  expiresAt: string;
}

export interface ComplianceFramework {
  id: string;
  type: ComplianceFrameworkType;
  version: string;
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlCode: string;
}

export interface ComplianceRequirement {
  id: string;
  controlId: string;
  description: string;
}

export interface ComplianceAssessment {
  id: string;
  frameworkId: string;
  assessor: string;
  date: string;
}

export interface ComplianceEvidence {
  id: string;
  assessmentId: string;
  evidenceUrl: string;
}

export interface ComplianceReport {
  id: string;
  assessmentId: string;
  status: 'PASSED' | 'FAILED' | 'CONDITIONAL';
}

export interface AuditPolicy {
  id: string;
  retentionPolicyId: string;
  eventsToAudit: string[];
}

export interface AuditRetentionPolicy {
  id: string;
  type: RetentionPolicyType;
  durationDays: number;
}

export interface Risk {
  id: string;
  description: string;
  level: RiskLevel;
}

export interface RiskCategory {
  id: string;
  name: string;
}

export interface RiskAssessment {
  id: string;
  riskId: string;
  assessor: string;
  score: number;
}

export interface ThreatModel {
  id: string;
  systemId: string;
  threats: string[];
}

export interface Threat {
  id: string;
  category: ThreatCategory;
  description: string;
}

export interface ThreatMitigation {
  id: string;
  threatId: string;
  strategy: string;
}

export interface Vulnerability {
  id: string;
  cveId: string;
  severity: VulnerabilitySeverity;
}

export type VulnerabilitySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
}

export interface IncidentResponse {
  id: string;
  incidentId: string;
  responder: string;
  actionTaken: string;
}

export interface IncidentTimeline {
  id: string;
  incidentId: string;
  events: string[];
}

export interface LegalHold {
  id: string;
  entityId: string;
  reason: string;
  isActive: boolean;
}

export interface DataRetentionPolicy {
  id: string;
  type: RetentionPolicyType;
  durationDays: number;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  rules: string[];
}

export interface GovernanceRule {
  id: string;
  policyId: string;
  directive: string;
}

export interface GovernanceException {
  id: string;
  ruleId: string;
  justification: string;
  expiresAt: string;
}

export interface SecurityConfiguration {
  id: string;
  globalSecurityLevel: SecurityLevel;
  requireMfa: boolean;
}
