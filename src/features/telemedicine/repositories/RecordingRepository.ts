import { SessionRecordingMetadata, RecordingStatus } from '../types';

export class RecordingRepository {
  async findById(id: string): Promise<SessionRecordingMetadata | null> {
    throw new Error('Not implemented');
  }

  async findBySessionId(sessionId: string): Promise<SessionRecordingMetadata | null> {
    throw new Error('Not implemented');
  }

  async save(recording: SessionRecordingMetadata): Promise<SessionRecordingMetadata> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: RecordingStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
