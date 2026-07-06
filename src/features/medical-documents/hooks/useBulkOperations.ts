import { useState, useCallback, useMemo } from 'react';
import { ExportService } from '../services/ExportService';
import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';

export function useBulkOperations() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const exportService = useMemo(() => new ExportService(), []);
  const healthVaultService = useMemo(() => new HealthVaultService(), []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const isRecordSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  /**
   * Archives all selected records sequentially.
   */
  const executeBulkArchive = useCallback(async (
    recordsToArchive: Array<{ recordId: string; type: string }>,
    archiverId: string,
    ownerId: string,
    actorRole = 'citizen'
  ) => {
    for (const record of recordsToArchive) {
      if (selectedIds.has(record.recordId)) {
        // HealthVaultService expects: recordType, recordId, archiverId, ownerId, actorRole
        await healthVaultService.archiveRecord(
          record.type as 'prescription' | 'lab_report' | 'vaccination' | 'discharge_summary' | 'medical_certificate' | 'consultation' | 'radiology_report',
          record.recordId,
          archiverId,
          ownerId,
          actorRole
        );
      }
    }
    clearSelection();
  }, [selectedIds, healthVaultService, clearSelection]);

  /**
   * Restores all selected records sequentially.
   */
  const executeBulkRestore = useCallback(async (
    recordsToRestore: Array<{ recordId: string; type: string }>,
    restorerId: string,
    ownerId: string,
    actorRole = 'citizen'
  ) => {
    for (const record of recordsToRestore) {
      if (selectedIds.has(record.recordId)) {
        await healthVaultService.restoreRecord(
          record.type as 'prescription' | 'lab_report' | 'vaccination' | 'discharge_summary' | 'medical_certificate' | 'consultation' | 'radiology_report',
          record.recordId,
          restorerId,
          ownerId,
          actorRole
        );
      }
    }
    clearSelection();
  }, [selectedIds, healthVaultService, clearSelection]);

  /**
   * Compiles and downloads ZIP file client-side.
   */
  const executeBulkExport = useCallback(async (
    records: Array<{ recordId: string; type: string; title: string; detailsSummary: string }>,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string },
    progressCallback?: (percentage: number) => void
  ) => {
    const selectedRecords = records.filter(r => selectedIds.has(r.recordId));
    if (selectedRecords.length === 0) return;

    await exportService.exportMultipleRecords(selectedRecords, ownerId, actorContext, progressCallback);
    clearSelection();
  }, [selectedIds, exportService, clearSelection]);

  /**
   * Compiles and prints multiple documents.
   */
  const executeBulkPrint = useCallback(async (
    records: Array<{ recordId: string; title: string; date: string; provider: string; detailsHtml: string }>,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ) => {
    const selectedRecords = records.filter(r => selectedIds.has(r.recordId));
    if (selectedRecords.length === 0) return;

    await exportService.printMultipleRecords(selectedRecords, ownerId, actorContext);
    clearSelection();
  }, [selectedIds, exportService, clearSelection]);

  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    selectAll,
    isRecordSelected,
    executeBulkArchive,
    executeBulkRestore,
    executeBulkExport,
    executeBulkPrint,
  };
}

export default useBulkOperations;
