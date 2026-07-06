export class RadiologyError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'RadiologyError';
  }
}

export class StudyNotFoundError extends RadiologyError {
  constructor(studyInstanceUid: string) {
    super(`Imaging Study with UID "${studyInstanceUid}" was not found.`, 'STUDY_NOT_FOUND');
    this.name = 'StudyNotFoundError';
  }
}

export class InvalidDicomMetadataError extends RadiologyError {
  constructor(details: string) {
    super(`Invalid DICOM metadata: ${details}`, 'INVALID_DICOM_METADATA');
    this.name = 'InvalidDicomMetadataError';
  }
}

export class StudyNotReadyError extends RadiologyError {
  constructor(studyInstanceUid: string, status: string) {
    super(`Study "${studyInstanceUid}" is currently in status "${status}" and cannot accept reports yet.`, 'STUDY_NOT_READY');
    this.name = 'StudyNotReadyError';
  }
}
