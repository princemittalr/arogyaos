import JSZip from 'jszip';
import { StorageRepository } from '@/features/health-vault/repositories/StorageRepository';
import { auditLogger } from '@/features/health-vault/services/AuditLogger';
import { AuditAction } from '@/features/health-vault/core/auditEvents';

export class ExportService {
  private readonly storageRepo = new StorageRepository();

  /**
   * Downloads multiple files and compiles them into a ZIP archive along with a summary JSON.
   */
  public async exportMultipleRecords(
    records: Array<{ recordId: string; type: string; title: string; detailsSummary: string }>,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string },
    progressCallback?: (percentage: number) => void
  ): Promise<void> {
    if (records.length === 0) return;

    const zip = new JSZip();
    const summaryData: Record<string, unknown>[] = [];
    
    // 1. Gather all file mappings for the selected records
    const filesToDownload: Array<{ fileId: string; fileName: string; recordTitle: string }> = [];

    for (const r of records) {
      const fileMetaList = await this.storageRepo.getFileMetadataByRecordId(r.recordId);
      for (const meta of fileMetaList) {
        filesToDownload.push({
          fileId: meta.fileId,
          fileName: meta.originalFileName,
          recordTitle: r.title,
        });
      }

      summaryData.push({
        recordId: r.recordId,
        type: r.type,
        title: r.title,
        summary: r.detailsSummary,
        exportedAt: new Date().toISOString(),
      });
    }

    // 2. Fetch file blobs concurrently/sequentially with progress logging
    let completedCount = 0;
    const totalCount = filesToDownload.length;

    if (progressCallback) progressCallback(0);

    for (const fileItem of filesToDownload) {
      try {
        const response = await fetch(`/api/health-vault/download?fileId=${fileItem.fileId}`);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${fileItem.fileName}`);
        }
        const blob = await response.blob();
        
        // Add to ZIP (nest files inside a folder matching record title if necessary)
        const uniqueFileName = `${fileItem.recordTitle.replace(/[/\\?%*:|"<>. ]/g, '_')}_${fileItem.fileName}`;
        zip.file(uniqueFileName, blob);
      } catch (err) {
        console.error(`[ExportService] Error exporting file ${fileItem.fileId}:`, err);
      } finally {
        completedCount++;
        if (progressCallback) {
          progressCallback(Math.round((completedCount / totalCount) * 100));
        }
      }
    }

    // 3. Add summary JSON to ZIP
    zip.file('export_summary.json', JSON.stringify(summaryData, null, 2));

    // 4. Generate ZIP binary and trigger browser download
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `arogyaos-health-export-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Audit Logging
    await auditLogger.success('BULK_EXPORTED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      metadata: { recordsCount: records.length, filesCount: totalCount },
    });
  }

  /**
   * Compiles multiple records into a unified HTML design and prints them via a hidden iframe.
   */
  public async printMultipleRecords(
    records: Array<{ title: string; date: string; provider: string; detailsHtml: string }>,
    ownerId: string,
    actorContext: { actorId: string; actorRole: string; deviceId?: string }
  ): Promise<void> {
    if (records.length === 0) return;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      throw new Error('Unable to construct printing window context.');
    }

    // Print template
    const recordsMarkup = records
      .map(
        (r) => `
      <div class="record-page">
        <div class="header">
          <h2>${r.title}</h2>
          <div class="meta">
            <span><strong>Date:</strong> ${r.date}</span>
            <span><strong>Provider:</strong> ${r.provider}</span>
          </div>
        </div>
        <hr />
        <div class="content">
          ${r.detailsHtml}
        </div>
      </div>
      <div class="page-break"></div>
    `
      )
      .join('');

    const htmlContent = `
      <html>
        <head>
          <title>ArogyaOS Health Records Printout</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.5;
            }
            .record-page {
              margin-bottom: 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header h2 {
              margin: 0;
              color: #1d4ed8;
              font-size: 20px;
            }
            .meta {
              font-size: 13px;
              color: #64748b;
            }
            .meta span {
              margin-left: 15px;
            }
            hr {
              border: 0;
              border-top: 1px solid #e2e8f0;
              margin: 15px 0;
            }
            .content {
              font-size: 14px;
            }
            @media print {
              .page-break {
                page-break-after: always;
              }
              body {
                margin: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; color: #0f172a; font-size: 24px;">ArogyaOS Personal Health Record Summary</h1>
          <p style="text-align: center; font-size: 12px; color: #64748b; margin-top: -10px;">Generated: ${new Date().toLocaleString()}</p>
          <hr style="border-top: 2px solid #0f172a;" />
          ${recordsMarkup}
        </body>
      </html>
    `;

    doc.write(htmlContent);
    doc.close();

    // Trigger Print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Clean up after dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);

    // Audit Logging
    await auditLogger.success('BULK_PRINTED' as AuditAction, {
      ownerId,
      actorId: actorContext.actorId,
      actorRole: actorContext.actorRole,
      deviceId: actorContext.deviceId,
      metadata: { recordsCount: records.length },
    });
  }
}

export default ExportService;
