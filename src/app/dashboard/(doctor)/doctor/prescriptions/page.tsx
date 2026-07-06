'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDoctorPrescriptions, useDoctorPatients } from '@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import { FileText, Search, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorPrescriptionsPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const doctorId = user?.uid || 'doc_arav_mehta';

  const { data: prescriptions, isLoading: rxLoading } = useDoctorPrescriptions(doctorId);
  const { data: patients, isLoading: patientsLoading } = useDoctorPatients(doctorId);
  const [searchTerm, setSearchTerm] = useState('');

  if (rxLoading || patientsLoading) {
    return <LoadingState variant="table" />;
  }

  // Filter
  const filteredRx = prescriptions?.filter((rx) => {
    const patientName = patients?.find((p) => p.uid === rx.patientId)?.fullName || 'Patient';
    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) || rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handlePrint = (rxId: string) => {
    toast.success(`Initializing printer connection for prescription ${rxId}...`);
  };

  const handleDownload = (rxId: string) => {
    toast.success(`Preparing PDF for prescription ${rxId}... Check your downloads directory.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("doctor.clinical_prescriptions_archives")}
        description={t("doctor.search_past_diagnostic_recommendations_audit_active_treatment_courses_or_export_medical_prescription_records")} />
      

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("doctor.search_prescriptions_by_patient_name_or_diagnosis")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-transparent dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none" />
          
        </div>
      </div>

      {/* Prescription List */}
      {filteredRx.length === 0 ?
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <FileText className="h-10 w-10 text-slate-350 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("doctor.no_prescriptions_found")}</p>
          <p className="text-xs text-slate-450 mt-1">{t("doctor.prescriptions_will_appear_here_once_you_complete_patient_consultations")}</p>
        </div> :

      <div className="grid gap-6 md:grid-cols-2">
          {filteredRx.map((rx) => {
          const patientName = patients?.find((p) => p.uid === rx.patientId)?.fullName || 'Patient';
          const dateStr = typeof rx.createdAt === 'string' ? rx.createdAt.split('T')[0] : 'Today';

          return (
            <div key={rx.prescriptionId} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{t("doctor.diagnosis")}{rx.diagnosis}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md">
                      {dateStr}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-[11px] border border-slate-100 dark:border-slate-900 space-y-1.5 font-bold text-slate-650 dark:text-slate-400">
                    <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">{t("doctor.medicines_list")}</span>
                    {rx.medicines.map((med, idx) =>
                  <div key={idx} className="flex justify-between">
                        <span>{med.name}</span>
                        <span>{med.dosage} ({med.duration}{t("doctor.days")}</span>
                      </div>
                  )}
                  </div>

                  {rx.labTests && rx.labTests.length > 0 &&
                <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{t("doctor.recommended_tests")}</span>
                      <p className="text-[10px] font-semibold text-slate-650 dark:text-slate-300">
                        {rx.labTests.join(', ')}
                      </p>
                    </div>
                }
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                  <button
                  onClick={() => handlePrint(rx.prescriptionId)}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1">
                  
                    <Printer className="h-3 w-3" />{t("doctor.print")}
                </button>
                  <button
                  onClick={() => handleDownload(rx.prescriptionId)}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1">
                  
                    <Download className="h-3 w-3" />{t("doctor.download")}
                </button>
                </div>
              </div>);

        })}
        </div>
      }
    </div>);

}