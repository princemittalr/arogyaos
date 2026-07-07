import { ConsultationSummary, ConsultationNote } from '../types';

export class ConsultationRepository {
  async findSummaryBySessionId(sessionId: string): Promise<ConsultationSummary | null> {
    throw new Error('Not implemented');
  }

  async saveSummary(summary: ConsultationSummary): Promise<ConsultationSummary> {
    throw new Error('Not implemented');
  }

  async findNotesBySessionId(sessionId: string): Promise<ConsultationNote[]> {
    throw new Error('Not implemented');
  }

  async saveNote(note: ConsultationNote): Promise<ConsultationNote> {
    throw new Error('Not implemented');
  }
}
