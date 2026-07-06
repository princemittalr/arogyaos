import { useState, useEffect, useCallback } from 'react';
import { TagService } from '../services/TagService';
import { Tag, DocumentMapping } from '../types';

// Module-level caches
const tagsCache: Record<string, Tag[]> = {};
const mappingsCache: Record<string, DocumentMapping[]> = {};

export function useTags(ownerId: string, actorContext?: { actorId: string; actorRole: string; deviceId?: string }) {
  const [tags, setTags] = useState<Tag[]>(tagsCache[ownerId] || []);
  const [mappings, setMappings] = useState<DocumentMapping[]>(mappingsCache[ownerId] || []);
  const [loading, setLoading] = useState<boolean>(!tagsCache[ownerId]);
  const [error, setError] = useState<string | null>(null);

  const tagService = useCallback(() => new TagService(), []);
  const defaultActor = useCallback(() => {
    return actorContext || {
      actorId: ownerId,
      actorRole: 'citizen',
    };
  }, [ownerId, actorContext]);

  const fetchData = useCallback(async (force = false) => {
    if (!ownerId) return;
    if (!force && tagsCache[ownerId] && mappingsCache[ownerId]) {
      setTags(tagsCache[ownerId]);
      setMappings(mappingsCache[ownerId]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const service = tagService();
      const [fetchedTags, fetchedMappings] = await Promise.all([
        service.getTags(ownerId),
        service.getDocumentMappings(ownerId),
      ]);
      tagsCache[ownerId] = fetchedTags;
      mappingsCache[ownerId] = fetchedMappings;
      setTags(fetchedTags);
      setMappings(fetchedMappings);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve tags and associations.');
    } finally {
      setLoading(false);
    }
  }, [ownerId, tagService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTag = async (name: string, color: string) => {
    try {
      setError(null);
      const tagId = await tagService().createTag(name, color, ownerId, defaultActor());
      await fetchData(true);
      return tagId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create tag.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      setError(null);
      await tagService().deleteTag(tagId, ownerId, defaultActor());
      await fetchData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete tag.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const assignDocumentFolder = async (recordId: string, folderId: string | null) => {
    try {
      setError(null);
      await tagService().assignDocumentFolder(recordId, folderId, ownerId, defaultActor());
      await fetchData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update folder mapping.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const assignDocumentTags = async (recordId: string, tagIds: string[]) => {
    try {
      setError(null);
      await tagService().assignDocumentTags(recordId, tagIds, ownerId, defaultActor());
      await fetchData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign document tags.';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    tags,
    mappings,
    loading,
    error,
    createTag,
    deleteTag,
    assignDocumentFolder,
    assignDocumentTags,
    refreshTags: () => fetchData(true),
  };
}

export default useTags;
