import { LabReportRecord } from '../types';

export class LabPdfService {
  public print(report: LabReportRecord, patientName: string, patientAge = 32, patientGender = 'Male'): void {
    const dateStr = report.metadata?.createdAt
      ? new Date(
          (report.metadata.createdAt as { toDate?: () => Date }).toDate
            ? (report.metadata.createdAt as { toDate: () => Date }).toDate()
            : (report.metadata.createdAt as string)
        ).toLocaleDateString()
      : new Date().toLocaleDateString();

    const resultRows = (report.observations || []).map((obs) => {
      const statusClass = obs.isAbnormal ? 'status-abnormal' : 'status-normal';
      const statusText = obs.isAbnormal ? 'ABNORMAL' : 'NORMAL';
      return `
        <tr>
          <td style="font-weight: 700; color: #334155; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${obs.parameter}</td>
          <td style="font-weight: bold; color: #0f172a; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${obs.value} ${obs.unit}</td>
          <td style="color: #64748b; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${obs.referenceRange}</td>
          <td class="${statusClass}" style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">${statusText}</td>
        </tr>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Lab Report – ${report.testName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 30px; color: #1e293b; line-height: 1.5; background: #ffffff; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .logo-cell { width: 60px; vertical-align: top; }
    .logo-box { width: 48px; height: 48px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; }
    .title-cell { vertical-align: top; padding-left: 12px; }
    .hospital-name { font-size: 18px; font-weight: 800; color: #1e3a8a; margin: 0; }
    .lab-name { font-size: 13px; color: #475569; margin: 2px 0 0 0; font-weight: 500; }
    .meta-cell { text-align: right; vertical-align: top; }
    .report-title { font-size: 20px; font-weight: 850; color: #1e293b; margin: 0; letter-spacing: -0.02em; }
    .report-id { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 4px; }
    .divider { border-top: 2px solid #e2e8f0; margin: 15px 0; }
    
    .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
    .info-grid td { padding: 6px 8px; vertical-align: top; }
    .info-label { color: #64748b; font-weight: 600; width: 15%; }
    .info-value { color: #0f172a; font-weight: 750; width: 35%; }
    
    .results-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    .results-table th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; color: #475569; font-weight: 700; padding: 10px 12px; text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
    
    .status-normal { color: #16a34a; }
    .status-abnormal { color: #dc2626; }
    
    .footer-section { margin-top: 50px; width: 100%; border-collapse: collapse; }
    .qr-cell { width: 100px; }
    .qr-box { width: 80px; height: 80px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8px; color: #64748b; font-weight: bold; background: #f8fafc; }
    .qr-graphic { width: 55px; height: 55px; background: repeating-linear-gradient(45deg, #cbd5e1, #cbd5e1 5px, #ffffff 5px, #ffffff 10px); margin-bottom: 4px; border-radius: 4px; }
    .sign-cell { text-align: right; vertical-align: bottom; font-size: 12px; }
    .sign-line { border-top: 1px solid #94a3b8; width: 180px; display: inline-block; margin-bottom: 5px; }
    .sign-title { color: #64748b; font-weight: 600; font-size: 11px; }
    
    .disclaimer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 15px; }
    
    @media print {
      body { padding: 0; }
      @page { size: A4; margin: 20mm; }
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td class="logo-cell">
        <div class="logo-box">✚</div>
      </td>
      <td class="title-cell">
        <h1 class="hospital-name">${report.laboratoryName}</h1>
        <p class="lab-name">Department of Laboratory Diagnostics &bull; Chief Tech: ${report.technicianName}</p>
      </td>
      <td class="meta-cell">
        <h2 class="report-title">LABORATORY REPORT</h2>
        <div class="report-id">ID: ${report.recordId.toUpperCase()}</div>
      </td>
    </tr>
  </table>
  
  <div class="divider"></div>
  
  <table class="info-grid">
    <tr>
      <td class="info-label">Patient Name:</td>
      <td class="info-value">${patientName}</td>
      <td class="info-label">Report Date:</td>
      <td class="info-value">${dateStr}</td>
    </tr>
    <tr>
      <td class="info-label">Age / Gender:</td>
      <td class="info-value">${patientAge} Y / ${patientGender}</td>
      <td class="info-label">Referring Dr:</td>
      <td class="info-value">Self/Reference</td>
    </tr>
    <tr>
      <td class="info-label">Report Status:</td>
      <td class="info-value" style="color: #16a34a; text-transform: uppercase;">FINAL</td>
      <td class="info-label">Sample Date:</td>
      <td class="info-value">${dateStr}</td>
    </tr>
  </table>
  
  <h3 style="font-size: 13px; color: #1e3a8a; margin: 20px 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Test Results: ${report.testName}</h3>
  
  <table class="results-table">
    <thead>
      <tr>
        <th style="width: 30%; text-align: left;">Test Parameter</th>
        <th style="width: 25%; text-align: left;">Observed Value</th>
        <th style="width: 25%; text-align: left;">Reference Range</th>
        <th style="width: 20%; text-align: left;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${resultRows}
    </tbody>
  </table>
  
  <table class="footer-section">
    <tr>
      <td class="qr-cell">
        <div class="qr-box">
          <div class="qr-graphic"></div>
          SECURE REPORT
        </div>
      </td>
      <td>
        <p style="font-size: 11px; color: #64748b; margin: 0 0 0 15px; line-height: 1.4;">
          This report is digitally signed and authorized. You can scan the QR code to verify its authenticity on the secure ArogyaOS server registry.
        </p>
      </td>
      <td class="sign-cell">
        <div class="sign-line"></div>
        <div><strong>${report.technicianName}</strong></div>
        <div class="sign-title">Chief Pathologist / Lead Technician</div>
      </td>
    </tr>
  </table>
  
  <div class="disclaimer">
    <strong>Disclaimer:</strong> This laboratory report is intended solely for clinical correlation by registered medical practitioners. Diagnostic results should not be interpreted in isolation and must be evaluated alongside patient history and other diagnostic protocols.
    <br>Generated securely via ArogyaOS Healthcare Registry on ${new Date().toLocaleString()}.
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 500);
    } else {
      console.error('Failed to open print window. Please allow popups.');
    }
  }
}
export default LabPdfService;
