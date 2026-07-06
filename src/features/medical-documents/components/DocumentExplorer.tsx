import React, { useState, useMemo } from 'react';
import { ChevronRight, Plus, FolderOpen, RefreshCw } from 'lucide-react';
import { useFolders } from '../hooks/useFolders';
import { useTags } from '../hooks/useTags';
import { useBulkOperations } from '../hooks/useBulkOperations';
import { useHealthVault } from '@/features/health-vault/hooks/useHealthVault';
import { DownloadService } from '@/features/health-vault/services/DownloadService';
import { StorageRepository } from '@/features/health-vault/repositories/StorageRepository';
import { FolderCard } from './FolderCard';
import { DocumentRow } from './DocumentRow';
import { BulkActionsBar } from './BulkActionsBar';
import { TagAssignModal } from './TagAssignModal';
import { FolderAssignModal } from './FolderAssignModal';
import { cn } from '@/utils/cn';

interface DocumentExplorerProps {
  ownerId: string;
  actorContext?: { actorId: string; actorRole: string; deviceId?: string };
  onViewRecordDetails: (recordType: string, recordId: string) => void;
}

export const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  ownerId,
  actorContext,
  onViewRecordDetails,
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [assigningFolderRecordId, setAssigningFolderRecordId] = useState<string | null>(null);
  const [assigningTagsRecordId, setAssigningTagsRecordId] = useState<string | null>(null);

  // Services
  const downloadService = useMemo(() => new DownloadService(), []);
  const storageRepo = useMemo(() => new StorageRepository(), []);

  // Fetch folders, tags/mappings, and primary records
  const {
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useFolders(ownerId, actorContext);

  const {
    tags,
    mappings,
    createTag,
    assignDocumentFolder,
    assignDocumentTags,
  } = useTags(ownerId, actorContext);

  const {
    rawRecords,
    retry: refreshRecords,
  } = useHealthVault(ownerId);

  // Bulk Operations State
  const {
    selectedIds,
    toggleSelection,
    clearSelection,
    selectAll,
    executeBulkArchive,
    executeBulkExport,
    executeBulkPrint,
  } = useBulkOperations();

  // Resolved actor context fallback
  const resolvedActorContext = useMemo(() => {
    return actorContext || {
      actorId: ownerId,
      actorRole: 'citizen',
    };
  }, [ownerId, actorContext]);

  // ─── Filtered Lists & Navigation ───────────────────────────────────────────

  // Breadcrumbs path calculation
  const breadcrumbs = useMemo(() => {
    const list: Array<{ id: string | null; name: string }> = [{ id: null, name: 'Root' }];
    if (!activeFolderId) return list;

    let current = folders.find((f) => f.folderId === activeFolderId);
    const path: Array<{ id: string; name: string }> = [];

    while (current) {
      path.unshift({ id: current.folderId, name: current.name });
      current = current.parentFolderId
        ? folders.find((f) => f.folderId === current?.parentFolderId)
        : undefined;
    }

    return [...list, ...path];
  }, [activeFolderId, folders]);

  // Subfolders inside current active folder
  const currentSubfolders = useMemo(() => {
    return folders.filter((f) => f.parentFolderId === activeFolderId);
  }, [folders, activeFolderId]);

  // Mapped documents helper mapping
  const docMappingMap = useMemo(() => {
    const map = new Map<string, typeof mappings[number]>();
    for (const m of mappings) {
      map.set(m.recordId, m);
    }
    return map;
  }, [mappings]);

  // Folder names mapping helper
  const folderNamesMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of folders) {
      map.set(f.folderId, f.name);
    }
    return map;
  }, [folders]);

  // Filter records belonging to the current active folder
  const currentRecords = useMemo(() => {
    return rawRecords.filter((record) => {
      const mapping = docMappingMap.get(record.recordId);
      const docFolderId = mapping ? mapping.folderId : null;
      return docFolderId === activeFolderId;
    });
  }, [rawRecords, docMappingMap, activeFolderId]);

  const handleCreateFolderClick = async () => {
    const name = window.prompt('Enter folder name:');
    if (!name) return;
    try {
      await createFolder(name, activeFolderId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRenameFolderClick = async (fid: string, currentName: string) => {
    const name = window.prompt('Rename folder:', currentName);
    if (!name) return;
    try {
      await renameFolder(fid, name);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteFolderClick = async (fid: string) => {
    if (window.confirm('Are you sure you want to delete this folder? All subfolders will be deleted recursively.')) {
      try {
        await deleteFolder(fid);
        // If current folder was deleted, return to Root
        if (activeFolderId === fid) {
          setActiveFolderId(null);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const handleDownloadFile = async (record: typeof rawRecords[number]) => {
    try {
      // Find associated files for this clinical record in health_vault_file_metadata
      const fileMetaList = await storageRepo.getFileMetadataByRecordId(record.recordId);
      if (fileMetaList.length > 0) {
        const fileId = fileMetaList[0].fileId;
        await downloadService.downloadFile(fileId, ownerId, resolvedActorContext.actorRole);
      } else {
        alert('No downloadable file attached to this record.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleBulkExport = () => {
    const formattedRecords = currentRecords.map(r => ({
      recordId: r.recordId,
      type: r.recordType,
      title: r.summaryFields.title,
      detailsSummary: `${r.summaryFields.providerName} - ${r.summaryFields.hospitalName}`,
    }));
    executeBulkExport(formattedRecords, ownerId, resolvedActorContext);
  };

  const handleBulkPrint = () => {
    const formattedRecords = currentRecords.map(r => ({
      recordId: r.recordId,
      title: r.summaryFields.title,
      date: new Date().toLocaleDateString(),
      provider: r.summaryFields.providerName,
      detailsHtml: `<p>${r.summaryFields.hospitalName}</p>`,
    }));
    executeBulkPrint(formattedRecords, ownerId, resolvedActorContext);
  };

  const handleBulkArchive = () => {
    const formattedRecords = currentRecords.map(r => ({
      recordId: r.recordId,
      type: r.recordType,
    }));
    executeBulkArchive(formattedRecords, ownerId, ownerId, resolvedActorContext.actorRole);
  };

  return (
    <div className="space-y-6">
      {/* Navigation and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1.5 overflow-x-auto text-sm font-medium" aria-label="Breadcrumb">
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
              <button
                type="button"
                onClick={() => setActiveFolderId(b.id)}
                className={cn(
                  "hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0",
                  idx === breadcrumbs.length - 1
                    ? "text-slate-800 dark:text-slate-200 font-bold cursor-default pointer-events-none"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                {b.name}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleCreateFolderClick}
            className="flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Folder
          </button>
          <button
            type="button"
            onClick={() => refreshRecords()}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
            title="Refresh documents"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Folders Section */}
      {currentSubfolders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Folders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentSubfolders.map((f) => (
              <FolderCard
                key={f.folderId}
                folderId={f.folderId}
                name={f.name}
                onOpen={(id) => setActiveFolderId(id)}
                onRename={handleRenameFolderClick}
                onDelete={handleDeleteFolderClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Documents Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Documents ({currentRecords.length})
          </h3>
          {currentRecords.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (selectedIds.size === currentRecords.length) {
                  clearSelection();
                } else {
                  selectAll(currentRecords.map(r => r.recordId));
                }
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {selectedIds.size === currentRecords.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                <th className="py-3 pl-4 w-12" />
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Folder</th>
                <th className="py-3 px-3">Tags</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => {
                const mapping = docMappingMap.get(record.recordId);
                const currentTagIds = mapping ? mapping.tagIds : [];
                const currentFolderName = mapping && mapping.folderId ? folderNamesMap.get(mapping.folderId) || null : null;

                return (
                  <DocumentRow
                    key={record.recordId}
                    record={record}
                    tags={tags}
                    currentTagIds={currentTagIds}
                    currentFolderName={currentFolderName}
                    isSelected={selectedIds.has(record.recordId)}
                    onToggleSelect={() => toggleSelection(record.recordId)}
                    onView={() => onViewRecordDetails(record.recordType, record.recordId)}
                    onDownload={() => handleDownloadFile(record)}
                    onAssignFolder={() => setAssigningFolderRecordId(record.recordId)}
                    onAssignTags={() => setAssigningTagsRecordId(record.recordId)}
                  />
                );
              })}
              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400 dark:text-slate-500 italic">
                    <FolderOpen className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    This folder is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClear={clearSelection}
        onExport={handleBulkExport}
        onPrint={handleBulkPrint}
        onArchive={handleBulkArchive}
        onRestore={() => {}}
      />

      {/* Folder Assignment Modal */}
      <FolderAssignModal
        isOpen={assigningFolderRecordId !== null}
        onClose={() => setAssigningFolderRecordId(null)}
        folders={folders}
        selectedFolderId={
          assigningFolderRecordId
            ? docMappingMap.get(assigningFolderRecordId)?.folderId || null
            : null
        }
        onSave={async (folderId) => {
          if (assigningFolderRecordId) {
            await assignDocumentFolder(assigningFolderRecordId, folderId);
            setAssigningFolderRecordId(null);
          }
        }}
      />

      {/* Tag Assignment Modal */}
      <TagAssignModal
        isOpen={assigningTagsRecordId !== null}
        onClose={() => setAssigningTagsRecordId(null)}
        availableTags={tags}
        selectedTagIds={
          assigningTagsRecordId
            ? docMappingMap.get(assigningTagsRecordId)?.tagIds || []
            : []
        }
        onSave={async (tagIds) => {
          if (assigningTagsRecordId) {
            await assignDocumentTags(assigningTagsRecordId, tagIds);
            setAssigningTagsRecordId(null);
          }
        }}
        onCreateTag={createTag}
      />
    </div>
  );
};

export default DocumentExplorer;
