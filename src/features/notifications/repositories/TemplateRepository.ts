import { NotificationTemplate } from '../types';

export class TemplateRepository {
  async findById(id: string): Promise<NotificationTemplate | null> {
    throw new Error('Not implemented');
  }

  async save(template: NotificationTemplate): Promise<NotificationTemplate> {
    throw new Error('Not implemented');
  }

  async findByCategory(category: string): Promise<NotificationTemplate[]> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
