export interface VaultFileMetadata {
  fileId: string;
  ownerId: string;
  recordId: string;
  recordType: string;
  contentType: string;
  originalFileName: string;
  fileSize: number;
  checksum: string;
  hashAlgorithm: string;
  checksumVersion: string;
  uploadedAt: unknown; // Firestore Timestamp or Date
  uploadedBy: string;
  storagePath: string;
  status: 'ACTIVE' | 'ARCHIVED';
  version: number;
}
