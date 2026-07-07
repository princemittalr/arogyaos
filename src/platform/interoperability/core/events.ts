export interface InteroperabilityEventPayloads {
  'fhir:resource:registered': { resourceId: string; serverId: string };
  'fhir:profile:updated': { profileId: string; version: string };
  'hl7:message:mapped': { messageId: string };
  'dicom:study:registered': { studyId: string };
  'terminology:updated': { terminologyId: string };
  'mapping:created': { mappingId: string };
  'exchange:started': { transactionId: string };
  'exchange:completed': { transactionId: string; status: string };
  'sync:started': { jobId: string };
  'sync:completed': { jobId: string; status: string };
  'audit:logged': { auditId: string };
}

export type InteroperabilityEventType = keyof InteroperabilityEventPayloads;

export interface InteroperabilityEventBus {
  publish<T extends InteroperabilityEventType>(
    event: T,
    payload: InteroperabilityEventPayloads[T],
    metadata?: Record<string, unknown>
  ): Promise<void>;

  subscribe<T extends InteroperabilityEventType>(
    event: T,
    handler: (payload: InteroperabilityEventPayloads[T], metadata?: Record<string, unknown>) => Promise<void>
  ): () => void;
}
