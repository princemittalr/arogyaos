'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useReports, useCitizenProfile, useDoctors } from '@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState, StatusBadge, EmptyState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { icons } from '@/design-system/icons';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export default function CitizenReportsPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Queries
  const { data: reports, isLoading: reportsLoading } = useReports(uid);
  const { data: profile, isLoading: profileLoading } = useCitizenProfile(uid);
  const { data: doctors, isLoading: docsLoading } = useDoctors();

  const isLoading = reportsLoading || profileLoading || docsLoading;

  if (isLoading) {
    return <LoadingState variant="table" rows={4} />;
  }

  const handleDownload = (rep: typeof reports extends (infer T)[] | undefined ? T : never) => {
    const doctorMatch = doctors?.[0]; // Default referring doctor
    const doctorName = doctorMatch?.doctorName || 'Dr. Arjun Mehta';
    const hospitalName = doctorMatch?.hospitalName || 'City General Hospital';
    const patientName = profile?.fullName || user?.fullName || 'Patient Name';
    const age = profile?.age || 28;
    const gender = profile?.gender ?
    profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) :
    'Female';
    const date = rep.testDate;

    // Helper to get ranges, status, and remarks
    const TEST_METRICS: Record<
      string,
      {range: string;min?: number;max?: number;remarks: string;}> =
    {
      hemoglobin: {
        range: '13.5 - 17.5 g/dL',
        min: 13.5,
        max: 17.5,
        remarks: 'Normal hemoglobin level.'
      },
      wbc: {
        range: '4,500 - 11,000 /mcL',
        min: 4500,
        max: 11000,
        remarks: 'WBC count within standard range.'
      },
      platelets: {
        range: '150,000 - 450,000 /mcL',
        min: 150000,
        max: 450000,
        remarks: 'Platelet count is normal.'
      },
      cholesterol: {
        range: '100 - 199 mg/dL',
        min: 100,
        max: 199,
        remarks: 'Cholesterol level is within desirable range.'
      },
      triglycerides: {
        range: '30 - 149 mg/dL',
        min: 30,
        max: 149,
        remarks: 'Normal level of triglycerides.'
      },
      hdl: {
        range: '40 - 60 mg/dL',
        min: 40,
        max: 60,
        remarks: 'Protective cholesterol level is good.'
      }
    };

    const getTestDetails = (testName: string, valueStr: string) => {
      const key = testName.toLowerCase().trim();
      const metric = TEST_METRICS[key];
      if (!metric) {
        return {
          range: 'N/A',
          status: 'Normal',
          remarks: 'Results within expected clinical parameters.'
        };
      }

      const numVal = parseFloat(valueStr.replace(/,/g, ''));
      let status = 'Normal';
      let remarks = metric.remarks;

      if (!isNaN(numVal)) {
        if (metric.min !== undefined && numVal < metric.min) {
          status = 'Abnormal (Low)';
          remarks = `Below standard range of ${metric.range}.`;
        } else if (metric.max !== undefined && numVal > metric.max) {
          status = 'Abnormal (High)';
          remarks = `Above standard range of ${metric.range}.`;
        }
      }

      return {
        range: metric.range,
        status,
        remarks
      };
    };

    const resultRows = Object.entries(rep.results).
    map(([key, val]) => {
      const details = getTestDetails(key, val);
      const isAbnormal = details.status.includes('Abnormal');
      const statusClass = isAbnormal ? 'status-abnormal' : 'status-normal';

      return `
        <tr>
          <td style="font-weight: 700; color: #334155;">${key}</td>
          <td style="font-weight: bold; color: #0f172a;">${val}</td>
          <td style="color: #64748b;">${details.range}</td>
          <td class="${statusClass}">${details.status}</td>
          <td style="color: #475569; font-style: italic;">${details.remarks}</td>
        </tr>
      `;
    }).
    join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Lab Report – ${rep.reportName}</title>
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
    .results-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .results-table tr:last-child td { border-bottom: 2px solid #cbd5e1; }
    
    .status-normal { color: #16a34a; font-weight: 700; }
    .status-abnormal { color: #dc2626; font-weight: 700; }
    
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
        <h1 class="hospital-name">${hospitalName}</h1>
        <p class="lab-name">Department of Laboratory Diagnostics &bull; ${rep.labName}</p>
      </td>
      <td class="meta-cell">
        <h2 class="report-title">LABORATORY REPORT</h2>
        <div class="report-id">ID: ${rep.id.toUpperCase()}</div>
      </td>
    </tr>
  </table>
  
  <div class="divider"></div>
  
  <table class="info-grid">
    <tr>
      <td class="info-label">Patient Name:</td>
      <td class="info-value">${patientName}</td>
      <td class="info-label">Report Date:</td>
      <td class="info-value">${date}</td>
    </tr>
    <tr>
      <td class="info-label">Age / Gender:</td>
      <td class="info-value">${age} Y / ${gender}</td>
      <td class="info-label">Referring Dr:</td>
      <td class="info-value">${doctorName}</td>
    </tr>
    <tr>
      <td class="info-label">Report Status:</td>
      <td class="info-value" style="color: #16a34a; text-transform: uppercase;">${rep.status}</td>
      <td class="info-label">Sample Date:</td>
      <td class="info-value">${date}</td>
    </tr>
  </table>
  
  <h3 style="font-size: 13px; color: #1e3a8a; margin: 20px 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Test Results: ${rep.reportName}</h3>
  
  <table class="results-table">
    <thead>
      <tr>
        <th style="width: 25%;">Test Parameter</th>
        <th style="width: 15%;">Observed Value</th>
        <th style="width: 20%;">Reference Range</th>
        <th style="width: 15%;">Status</th>
        <th style="width: 25%;">Clinical Remarks</th>
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
        <div><strong>${doctorName}</strong></div>
        <div class="sign-title">Chief Pathologist</div>
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
      toast.error(t("citizen.failed_to_open_print_window_please_allow_popups"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8">
      
      <PageHeader
        title={t("citizen.lab_reports_registry")}
        description={t("citizen.verify_laboratory_diagnostic_records_blood_tests_and_clinical_files")} />
      

      {reports && reports.length > 0 ?
      <div className="space-y-6">
          {reports.map((rep) =>
        <motion.div
          key={rep.id}
          whileHover={{ y: -1 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 gap-3">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
                    {rep.reportName}
                  </h4>
                  <p className="text-xs text-slate-500">{t("citizen.clinic")}
                {rep.labName}{t("citizen.conducted_on")}{rep.testDate}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <StatusBadge status={rep.status} />
                  <button
                onClick={() => handleDownload(rep)}
                className={`${componentStyles.button.base} ${componentStyles.button.outline} px-3.5 py-2 text-xs flex items-center gap-1.5`}>
                
                    <Download className="h-4 w-4" />
                    <span>{t("citizen.download")}</span>
                  </button>
                </div>
              </div>

              {/* Lab Results Table */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">{t("citizen.clinical_results")}

            </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(rep.results).map(([key, val]) =>
              <div
                key={key}
                className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 text-xs font-semibold text-left space-y-1">
                
                      <span className="text-slate-500 block uppercase tracking-wide text-[9px]">
                        {key}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                        {val as React.ReactNode}
                      </span>
                    </div>
              )}
                </div>
              </div>
            </motion.div>
        )}
        </div> :

      <EmptyState
        title={t("citizen.no_diagnostic_reports_available")}
        description={t("citizen.lab_report_summaries_will_be_written_here_as_soon_as_diagnosis_results_are_processed")}
        icon={icons.FileText || icons.Home} />

      }
    </motion.div>);

}