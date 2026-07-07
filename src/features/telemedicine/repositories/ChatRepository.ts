import { ChatMessage, SessionAttachment } from '../types';

export class ChatRepository {
  async findMessageById(id: string): Promise<ChatMessage | null> {
    throw new Error('Not implemented');
  }

  async findMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    throw new Error('Not implemented');
  }

  async saveMessage(message: ChatMessage): Promise<ChatMessage> {
    throw new Error('Not implemented');
  }

  async deleteMessage(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async findAttachmentsBySessionId(sessionId: string): Promise<SessionAttachment[]> {
    throw new Error('Not implemented');
  }

  async saveAttachment(attachment: SessionAttachment): Promise<SessionAttachment> {
    throw new Error('Not implemented');
  }
}
