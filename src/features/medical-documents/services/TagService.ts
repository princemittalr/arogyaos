import { TagRepository } from '../repositories/TagRepository';
import { Tag, DocumentMapping } from '../types';
import { ulid } from '@/features/health-vault/utils/ulid';
import { auditLogger } from '@/features/health-vault/services/AuditLogger';
import { AuditAction } from '@/features/health-vault/core/auditEvents';

export class TagService {
  private readonly tagRepo = new TagRepository();

  /**
   * Creates a new custom tag.
   */
  public async createTag(
    name: string,
    color: string,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ): Promise<string> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Tag name cannot be empty');
    }
    if (trimmedName.length > 50) {
      throw new Error('Tag name cannot exceed 50 characters');
    }

    const tagId = ulid();
    const tag: Tag = {
      tagId,
      name: trimmedName,
      ownerId,
      color,
      createdAt: new Date(),
    };

    await this.tagRepo.create(tag);

    // Audit Logging
    await auditLogger.success('TAG_CREATED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      metadata: { tagId, name: trimmedName, color },
    });

    return tagId;
  }

  /**
   * Deletes a tag and unmaps it from all documents.
   */
  public async deleteTag(
    tagId: string,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ): Promise<void> {
    const tag = await this.tagRepo.getById(tagId);
    if (!tag) {
      throw new Error('Tag not found');
    }
    if (tag.ownerId !== ownerId) {
      throw new Error('Unauthorized access');
    }

    // 1. Delete tag
    await this.tagRepo.delete(tagId);

    // 2. Remove tagId reference from all mappings
    const mappings = await this.tagRepo.getDocumentMappingsByOwner(ownerId);
    for (const mapping of mappings) {
      if (mapping.tagIds.includes(tagId)) {
        const updatedTagIds = mapping.tagIds.filter(id => id !== tagId);
        if (updatedTagIds.length === 0 && !mapping.folderId) {
          // Clean up mapping entirely if it contains no folders or tags
          await this.tagRepo.deleteDocumentMapping(mapping.mappingId);
        } else {
          await this.tagRepo.saveDocumentMapping({
            ...mapping,
            tagIds: updatedTagIds,
            updatedAt: new Date(),
          });
        }
      }
    }

    // Audit Logging
    await auditLogger.success('TAG_DELETED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      metadata: { tagId, name: tag.name },
    });
  }

  /**
   * Maps a document to a folder.
   */
  public async assignDocumentFolder(
    recordId: string,
    folderId: string | null,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ): Promise<void> {
    let mapping = await this.tagRepo.getMappingByRecordId(recordId, ownerId);

    if (!mapping) {
      if (!folderId) return; // Nothing to clear if it doesn't exist
      mapping = {
        mappingId: ulid(),
        recordId,
        ownerId,
        folderId,
        tagIds: [],
        updatedAt: new Date(),
      };
    } else {
      mapping.folderId = folderId;
      mapping.updatedAt = new Date();
    }

    if (!mapping.folderId && mapping.tagIds.length === 0) {
      await this.tagRepo.deleteDocumentMapping(mapping.mappingId);
    } else {
      await this.tagRepo.saveDocumentMapping(mapping);
    }

    // Audit Logging
    await auditLogger.success('METADATA_UPDATED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      recordId,
      metadata: { folderId: folderId || 'null' },
    });
  }

  /**
   * Maps a document to a set of tags.
   */
  public async assignDocumentTags(
    recordId: string,
    tagIds: string[],
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ): Promise<void> {
    let mapping = await this.tagRepo.getMappingByRecordId(recordId, ownerId);

    if (!mapping) {
      if (tagIds.length === 0) return; // Nothing to map
      mapping = {
        mappingId: ulid(),
        recordId,
        ownerId,
        folderId: null,
        tagIds,
        updatedAt: new Date(),
      };
    } else {
      mapping.tagIds = tagIds;
      mapping.updatedAt = new Date();
    }

    if (!mapping.folderId && mapping.tagIds.length === 0) {
      await this.tagRepo.deleteDocumentMapping(mapping.mappingId);
    } else {
      await this.tagRepo.saveDocumentMapping(mapping);
    }

    // Audit Logging
    await auditLogger.success('DOCUMENTS_TAGGED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      recordId,
      metadata: { tagIds: tagIds.join(',') },
    });
  }

  /**
   * Fetches all tags for the user.
   */
  public async getTags(ownerId: string): Promise<Tag[]> {
    return this.tagRepo.getTagsByOwner(ownerId);
  }

  /**
   * Fetches all document mappings for the user.
   */
  public async getDocumentMappings(ownerId: string): Promise<DocumentMapping[]> {
    return this.tagRepo.getDocumentMappingsByOwner(ownerId);
  }
}

export default TagService;
