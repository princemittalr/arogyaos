import { PrescriptionRecord } from '../types';

export class PdfGenerationService {
  /**
   * Generates a clean, modern, print-optimized HTML string for the prescription.
   */
  public generateHtml(
    record: PrescriptionRecord,
    patientName: string,
    doctorName: string,
    hospitalName: string
  ): string {
    const dateStr = record.metadata?.createdAt
      ? new Date(
          (record.metadata.createdAt as { toDate?: () => Date }).toDate
            ? (record.metadata.createdAt as { toDate: () => Date }).toDate()
            : (record.metadata.createdAt as string)
        ).toLocaleDateString()
      : new Date().toLocaleDateString();

    const validUntilStr = record.validUntil
      ? new Date(
          (record.validUntil as { toDate?: () => Date }).toDate
            ? (record.validUntil as { toDate: () => Date }).toDate()
            : (record.validUntil as string)
        ).toLocaleDateString()
      : 'N/A';

    const medicineRows = record.medicines
      .map(
        (m) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 14px; font-weight: 600; color: #1e293b;">${m.name} ${m.brandName ? `(${m.brandName})` : ''}</td>
        <td style="padding: 12px 14px; color: #334155;">${m.strength || 'N/A'}</td>
        <td style="padding: 12px 14px; color: #334155;">
          <span style="background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">
            ${m.dosage.pattern}
          </span>
        </td>
        <td style="padding: 12px 14px; color: #334155;">${m.dosage.timing}</td>
        <td style="padding: 12px 14px; color: #334155; font-weight: 600;">${m.schedule.durationDays} Days</td>
      </tr>
    `
      )
      .join('');

    const attachmentsList = record.attachments && record.attachments.length > 0
      ? `<div style="margin-top: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <strong style="color: #475569; font-size: 12px;">Attached files:</strong>
          <span style="font-size: 12px; color: #64748b; margin-left: 8px;">
            ${record.attachments.map(a => a.originalFileName).join(', ')}
          </span>
         </div>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Prescription — Rx #${record.recordId.slice(-8).toUpperCase()}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: start;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .title-section h1 {
              color: #1d4ed8;
              font-size: 24px;
              margin: 0 0 4px 0;
            }
            .title-section p {
              color: #64748b;
              font-size: 13px;
              margin: 0 0 12px 0;
            }
            .badge {
              display: inline-block;
              background: #dbeafe;
              color: #1d4ed8;
              padding: 4px 12px;
              border-radius: 99px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .qr-code-placeholder {
              width: 90px;
              height: 90px;
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-size: 9px;
              color: #94a3b8;
              text-align: center;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 13px;
              border-bottom: 1px dashed #f1f5f9;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              color: #64748b;
            }
            .value {
              font-weight: 600;
              color: #334155;
            }
            .table-title {
              font-size: 14px;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 10px;
              font-weight: 700;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
              text-align: left;
            }
            th {
              background: #1d4ed8;
              color: #ffffff;
              padding: 12px 14px;
              font-weight: 600;
            }
            th:first-child {
              border-top-left-radius: 6px;
            }
            th:last-child {
              border-top-right-radius: 6px;
            }
            .notes-section {
              margin-top: 30px;
              padding: 16px 20px;
              border-left: 4px solid #1d4ed8;
              background: #f8fafc;
              border-radius: 0 8px 8px 0;
            }
            .notes-title {
              font-weight: 700;
              font-size: 13px;
              color: #475569;
              margin-bottom: 6px;
            }
            .notes-content {
              font-size: 13px;
              color: #515b6b;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }
            @media print {
              body {
                padding: 0;
              }
              .info-card {
                background: none !important;
                border: 1px solid #cbd5e1;
              }
              th {
                background: #1e3a8a !important;
                color: #ffffff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="title-section">
              <h1>🏥 ArogyaOS Prescription</h1>
              <p>Official Digital Clinical Prescription slip</p>
              <span class="badge">Rx #${record.recordId.slice(-8).toUpperCase()}</span>
            </div>
            <div class="qr-code-placeholder">
              <span style="font-weight: 700; margin-bottom: 2px;">SECURE CHECK</span>
              <span style="font-size: 8px;">${record.metadata?.checksum?.slice(0, 10) || 'VERIFIED'}</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <div class="info-row">
                <span class="label">Patient Name</span>
                <span class="value">${patientName}</span>
              </div>
              <div class="info-row">
                <span class="label">Diagnosis</span>
                <span class="value">${record.diagnosis}</span>
              </div>
              <div class="info-row">
                <span class="label">Prescription Date</span>
                <span class="value">${dateStr}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-row">
                <span class="label">Prescribing Physician</span>
                <span class="value">${doctorName}</span>
              </div>
              <div class="info-row">
                <span class="label">Hospital Facility</span>
                <span class="value">${hospitalName}</span>
              </div>
              <div class="info-row">
                <span class="label">Valid Until</span>
                <span class="value">${validUntilStr}</span>
              </div>
            </div>
          </div>

          <h3 class="table-title">Prescribed Medications</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 35%;">Medicine</th>
                <th style="width: 15%;">Strength</th>
                <th style="width: 15%;">Dosage</th>
                <th style="width: 20%;">Timing</th>
                <th style="width: 15%;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${medicineRows}
            </tbody>
          </table>

          ${record.notes ? `
            <div class="notes-section">
              <div class="notes-title">Clinical Notes / Special Directions</div>
              <div class="notes-content">${record.notes}</div>
            </div>
          ` : ''}

          ${attachmentsList}

          <div class="footer">
            Generated securely by ArogyaOS national digital health grid &bull; Checksum: ${record.metadata?.checksum || 'N/A'}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Triggers the browser print dialog for a prescription.
   */
  public print(
    record: PrescriptionRecord,
    patientName: string,
    doctorName: string,
    hospitalName: string
  ): void {
    const html = this.generateHtml(record, patientName, doctorName, hospitalName);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      // Allow styles to load before triggering print
      setTimeout(() => {
        win.print();
        // Close window after print dialog closes
        setTimeout(() => {
          win.close();
        }, 1000);
      }, 500);
    }
  }
}
export default PdfGenerationService;
