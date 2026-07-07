import { NotificationTemplate } from '../types';
import { NotificationTemplateRepository } from '../repositories';

export class NotificationTemplateService {
  constructor(private readonly templateRepo: NotificationTemplateRepository) {}

  async manageTemplateMetadata(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    throw new Error('Not implemented');
  }
}
