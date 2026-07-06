import { VaultMetadata, VaultOrigin } from '../types';
import { VaultStatus, VaultSource, FhirResourceType, FHIR_CONFIG, VAULT_STATUS } from '../core/constants';

/**
 * Calculates the SHA-256 checksum of a record payload.
 * Enforced to run server-side only to ensure client-side tampering is prevented.
 */
export function calculateServerChecksum(payload: Record<string, unknown>): string {
  // Strip out system fields if they exist in the payload to ensure checksum matches pure data
  const purePayload = { ...payload };
  delete purePayload.metadata;
  delete purePayload.recordId;
  delete purePayload.ownerId;
  
  // Sort keys to guarantee deterministic string representation
  const sortedPayload = sortObjectKeys(purePayload);
  const serialized = JSON.stringify(sortedPayload);

  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }
  
  throw new Error('Security Violation: Checksum calculation must occur server-side only.');
}

/**
 * Recursively sorts keys of an object to ensure deterministic JSON serialization.
 */
function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const typedObj = obj as Record<string, unknown>;
  return Object.keys(typedObj)
    .sort()
    .reduce((sorted: Record<string, unknown>, key) => {
      sorted[key] = sortObjectKeys(typedObj[key]);
      return sorted;
    }, {});
}

interface InitializeMetadataParams {
  ownerId: string;
  createdBy: string;
  source: VaultSource;
  resourceType: FhirResourceType;
  origin: VaultOrigin;
  status?: VaultStatus;
}

/**
 * Initializes a standard VaultMetadata payload.
 * Checksum is left blank initially, to be filled server-side by the ingestion pipeline.
 */
export function initializeVaultMetadata({
  ownerId,
  createdBy,
  source,
  resourceType,
  origin,
  status = VAULT_STATUS.PENDING_VERIFICATION,
}: InitializeMetadataParams): Omit<VaultMetadata, 'createdAt' | 'updatedAt'> {
  return {
    version: 1,
    status,
    source,
    ownerId,
    createdBy,
    updatedBy: createdBy,
    origin,
    verification: {
      isVerified: status === VAULT_STATUS.VERIFIED,
    },
    interoperability: {
      resourceType,
      fhirVersion: FHIR_CONFIG.DEFAULT_VERSION,
      hashAlgorithm: FHIR_CONFIG.HASH_ALGORITHM,
      checksumVersion: FHIR_CONFIG.CHECKSUM_VERSION,
    },
    checksum: '', // Populated on ingestion
  };
}
