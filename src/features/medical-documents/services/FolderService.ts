import { FolderRepository } from '../repositories/FolderRepository';
import { TagRepository } from '../repositories/TagRepository';
import { Folder } from '../types';
import { ulid } from '@/features/health-vault/utils/ulid';
import { auditLogger } from '@/features/health-vault/services/AuditLogger';
import { AuditAction } from '@/features/health-vault/core/auditEvents';

export class FolderService {
  private readonly folderRepo = new FolderRepository();
  private readonly tagRepo = new TagRepository();

  /**
   * Creates a new folder with depth validation.
   */
  public async createFolder(
    name: string,
    ownerId: string,
    parentFolderId: string | null,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ): Promise<string> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Folder name cannot be empty');
    }
    if (trimmedName.length > 100) {
      throw new Error('Folder name cannot exceed 100 characters');
    }

    // Depth Validation (Maximum 3 levels deep)
    if (parentFolderId) {
      let depth = 0;
      let currentParentId: string | null = parentFolderId;
      while (currentParentId) {
        depth++;
        if (depth > 2) {
          throw new Error('Maximum folder nesting depth of 3 exceeded');
        }
        const parentFolder = await this.folderRepo.getById(currentParentId);
        if (!parentFolder) break;
        currentParentId = parentFolder.parentFolderId;
      }
    }

    const folderId = ulid();
    const folder: Folder = {
      folderId,
      name: trimmedName,
      ownerId,
      parentFolderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.folderRepo.create(folder);

    // Audit Logging
    await auditLogger.success('FOLDER_CREATED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      metadata: { folderId, name: trimmedName, parentFolderId: parentFolderId || '' },
    });

    return folderId;
  }

  /**
   * Renames a folder.
   */
  public async renameFolder(
    folderId: string,
    newName: string,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ): Promise<void> {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      throw new Error('Folder name cannot be empty');
    }
    if (trimmedName.length > 100) {
      throw new Error('Folder name cannot exceed 100 characters');
    }

    const folder = await this.folderRepo.getById(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }
    if (folder.ownerId !== ownerId) {
      throw new Error('Unauthorized access');
    }

    await this.folderRepo.update(folderId, {
      name: trimmedName,
      updatedAt: new Date(),
    });

    // Audit Logging
    await auditLogger.success('FOLDER_UPDATED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      metadata: { folderId, oldName: folder.name, newName: trimmedName },
    });
  }

  /**
   * Deletes a folder recursively.
   */
  public async deleteFolder(
    folderId: string,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ): Promise<void> {
    const folder = await this.folderRepo.getById(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }
    if (folder.ownerId !== ownerId) {
      throw new Error('Unauthorized access');
    }

    // 1. Find all folders owned by owner to perform local traversal
    const allFolders = await this.folderRepo.getFoldersByOwner(ownerId);
    
    // 2. Identify child folders of folderId recursively
    const foldersToDelete = new Set<string>([folderId]);
    const findChildren = (parentId: string) => {
      for (const f of allFolders) {
        if (f.parentFolderId === parentId && !foldersToDelete.has(f.folderId)) {
          foldersToDelete.add(f.folderId);
          findChildren(f.folderId);
        }
      }
    };
    findChildren(folderId);

    // 3. Delete folders and remove folderId mapping associations
    const mappings = await this.tagRepo.getDocumentMappingsByOwner(ownerId);
    for (const mapping of mappings) {
      if (mapping.folderId && foldersToDelete.has(mapping.folderId)) {
        await this.tagRepo.saveDocumentMapping({
          ...mapping,
          folderId: null,
          updatedAt: new Date(),
        });
      }
    }

    // Delete folders in database
    for (const fid of foldersToDelete) {
      await this.folderRepo.delete(fid);
    }

    // Audit Logging
    await auditLogger.success('FOLDER_DELETED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      metadata: { folderId, name: folder.name, subfoldersDeletedCount: foldersToDelete.size - 1 },
    });
  }

  /**
   * Returns a listing of all folders for the owner.
   */
  public async getFolders(ownerId: string): Promise<Folder[]> {
    return this.folderRepo.getFoldersByOwner(ownerId);
  }
}

export default FolderService;
