import { useState, useEffect, useCallback } from 'react';
import { FolderService } from '../services/FolderService';
import { Folder } from '../types';

// Module-level memory cache for folders to minimize Firestore reads
const foldersCache: Record<string, Folder[]> = {};

export function useFolders(ownerId: string, actorContext?: { actorId: string; actorRole: string; deviceId?: string }) {
  const [folders, setFolders] = useState<Folder[]>(foldersCache[ownerId] || []);
  const [loading, setLoading] = useState<boolean>(!foldersCache[ownerId]);
  const [error, setError] = useState<string | null>(null);

  const folderService = useCallback(() => new FolderService(), []);
  const defaultActor = useCallback(() => {
    return actorContext || {
      actorId: ownerId,
      actorRole: 'citizen',
    };
  }, [ownerId, actorContext]);

  const fetchFolders = useCallback(async (force = false) => {
    if (!ownerId) return;
    if (!force && foldersCache[ownerId]) {
      setFolders(foldersCache[ownerId]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await folderService().getFolders(ownerId);
      foldersCache[ownerId] = data;
      setFolders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve folder structures.');
    } finally {
      setLoading(false);
    }
  }, [ownerId, folderService]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (name: string, parentFolderId: string | null) => {
    try {
      setError(null);
      const newId = await folderService().createFolder(name, ownerId, parentFolderId, defaultActor());
      await fetchFolders(true);
      return newId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create folder.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      setError(null);
      await folderService().renameFolder(folderId, newName, ownerId, defaultActor());
      await fetchFolders(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to rename folder.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      setError(null);
      await folderService().deleteFolder(folderId, ownerId, defaultActor());
      await fetchFolders(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete folder.';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    folders,
    loading,
    error,
    createFolder,
    renameFolder,
    deleteFolder,
    refreshFolders: () => fetchFolders(true),
  };
}

export default useFolders;
