// ─── FHIR Interoperability Layer (HL7 FHIR R4 Mapping Interfaces) ──────────────
// These definitions are used for validating exports/imports to/from FHIR format.

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
    profile?: string[];
  };
}

export interface FHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRReference {
  reference: string; // e.g. "Patient/citizen-123"
  type?: string;
  display?: string;
}

export interface FHIRQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

// ── FHIR Encounter (Mapping to ConsultationRecord)
export interface FHIREncounter extends FHIRResource {
  resourceType: 'Encounter';
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: FHIRCoding;
  subject: FHIRReference; // Patient
  participant?: Array<{
    type?: FHIRCodeableConcept[];
    period?: FHIRPeriod;
    individual?: FHIRReference; // Practitioner
  }>;
  period?: FHIRPeriod;
  reasonCode?: FHIRCodeableConcept[];
}

// ── FHIR MedicationRequest (Mapping to PrescriptionRecord)
export interface FHIRMedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest';
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept?: FHIRCodeableConcept;
  subject: FHIRReference; // Patient
  encounter?: FHIRReference;
  authoredOn?: string;
  requester?: FHIRReference; // Practitioner
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
  }>;
}

// ── FHIR Observation (Mapping to LabObservation)
export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: FHIRReference; // Patient
  encounter?: FHIRReference;
  effectiveDateTime?: string;
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: Array<{
    low?: FHIRQuantity;
    high?: FHIRQuantity;
    type?: FHIRCodeableConcept;
    text?: string;
  }>;
}

// ── FHIR DiagnosticReport (Mapping to LabReportRecord)
export interface FHIRDiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport';
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: FHIRReference; // Patient
  encounter?: FHIRReference;
  effectiveDateTime?: string;
  issued?: string;
  performer?: FHIRReference[];
  result?: FHIRReference[]; // References to FHIRObservation resources
  presentedForm?: Array<{
    contentType?: string;
    url?: string;
    size?: number;
    title?: string;
  }>; // Attachment details
}

// ── FHIR Immunization (Mapping to VaccinationRecord)
export interface FHIRImmunization extends FHIRResource {
  resourceType: 'Immunization';
  status: 'completed' | 'not-done';
  statusReason?: FHIRCodeableConcept;
  vaccineCode: FHIRCodeableConcept;
  patient: FHIRReference;
  occurrenceDateTime: string;
  primarySource: boolean;
  lotNumber?: string;
  expirationDate?: string;
  manufacturer?: FHIRReference;
  performer?: Array<{
    actor: FHIRReference;
  }>;
}
