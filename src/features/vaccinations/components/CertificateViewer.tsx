'use client';

import React, { useRef } from 'react';
import { X, Shield, Download, Printer, CheckCircle } from 'lucide-react';
import { VaccinationCertificate } from '../types';

interface CertificateViewerProps {
  certificate: VaccinationCertificate;
  onClose: () => void;
}

export function CertificateViewer({ certificate, onClose }: CertificateViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;

    if (printContent) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Vaccination Certificate - ${certificate.certificateNumber}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body class="p-8 bg-white text-slate-900" onload="window.print(); window.close();">
              ${printContent}
            </body>
          </html>
        `);
        win.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-50">Immunization Certificate</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Certificate Frame */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-950 rounded-2xl p-8 shadow-sm relative overflow-hidden"
          >
            {/* Border frame design */}
            <div className="absolute inset-4 border border-dashed border-indigo-100 dark:border-indigo-900 pointer-events-none rounded-lg" />

            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Certificate Head */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Government of India
                </h1>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Ministry of Health & Family Welfare
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  AROGYA DIGITAL HEALTH MISSION
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Beneficiary Name</p>
                  <p className="font-bold text-slate-900 dark:text-slate-50">{certificate.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Beneficiary ID (Health Vault)</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">{certificate.patientId}</p>
                </div>
              </div>

              {/* Vaccine Details */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Vaccine Name</p>
                    <p className="font-bold text-indigo-700 dark:text-indigo-400">{certificate.vaccineName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Date of Administration</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(certificate.administeredAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Immunization Facility</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{certificate.facilityName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Certificate Number</p>
                    <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {certificate.certificateNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR and Verification Footer */}
              <div className="flex items-center justify-between gap-6 pt-4">
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium">Digital Signature & Verification</p>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-950">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Digitally Signed by {certificate.verifierSignature}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    This certificate is cryptographically signed and can be verified online or by scanning the QR code.
                  </p>
                </div>

                {/* QR Code Graphic Placeholder */}
                <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex-shrink-0">
                  <div className="h-24 w-24 bg-slate-50 flex items-center justify-center border border-slate-100 rounded-lg overflow-hidden">
                    <svg className="w-20 h-20 text-slate-800" viewBox="0 0 100 100">
                      {/* Generates a dummy QR look */}
                      <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                      <rect x="10" y="10" width="15" height="15" fill="white" />
                      <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                      <rect x="75" y="10" width="15" height="15" fill="white" />
                      <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                      <rect x="10" y="75" width="15" height="15" fill="white" />
                      <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                      {/* Dots */}
                      <rect x="45" y="5" width="5" height="10" fill="currentColor" />
                      <rect x="5" y="45" width="10" height="5" fill="currentColor" />
                      <rect x="80" y="45" width="15" height="5" fill="currentColor" />
                      <rect x="45" y="80" width="5" height="15" fill="currentColor" />
                      <rect x="70" y="70" width="10" height="10" fill="currentColor" />
                      <rect x="90" y="90" width="5" height="5" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-slate-500 font-semibold mt-1">SCAN TO VERIFY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print Certificate
          </button>
          <button
            onClick={handlePrint} // reuses same printable link stream
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition shadow-sm"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
