'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { usePatientDetails } from '@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import {
  FileText,
  AlertTriangle,
  ArrowLeft } from
'lucide-react';
import Link from 'next/link';

interface PatientDetailsPageProps {
  params: Promise<{id: string;}>;
}

export default function PatientDetailsPage({ params }: PatientDetailsPageProps) {const { t } = useLanguage();
  const resolvedParams = React.use(params);
  const patientId = resolvedParams.id;

  const { data: patient, isLoading } = usePatientDetails(patientId);

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  if (!patient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">{t("doctor.patient_not_found")}</h3>
        <p className="text-xs text-slate-500 mt-1">{t("doctor.this_medical_profile_does_not_exist_or_has_been_archived")}</p>
        <Link href="/dashboard/doctor/patients" className="mt-4 inline-block text-xs font-bold text-blue-600 underline">{t("doctor.back_to_directory")}

        </Link>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/doctor/patients"
          className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 text-slate-650 dark:text-slate-300 transition">
          
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <PageHeader
            title={`${patient.fullName} - EMR Dossier`}
            description={t("doctor.inspect_active_vitals_telemetry_historical_consultations_timeline_and_clinical_diagnostic_lab_reports")} />
          
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Demographics & Vitals */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-lg">
                {patient.fullName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-50">{patient.fullName}</h3>
                <p className="text-[10px] text-slate-450 font-bold">{patient.email}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold text-slate-650 dark:text-slate-400 space-y-2">
              <div className="flex justify-between py-1.5 first:pt-0">
                <span>{t("doctor.age_gender")}</span>
                <span className="text-slate-850 dark:text-slate-100 capitalize">{patient.age} / {patient.gender}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>{t("doctor.blood_group")}</span>
                <span className="text-slate-850 dark:text-slate-100">{patient.bloodGroup}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>{t("doctor.emergency_contact")}</span>
                <span className="text-slate-850 dark:text-slate-100">{patient.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Allergies Alerts */}
          <div className="rounded-2xl border border-red-150 bg-red-50/25 p-5 dark:border-red-950/20 dark:bg-red-950/5 space-y-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-bold text-xs uppercase tracking-wider">{t("doctor.allergies_contraindications")}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.allergies?.map((allergy, idx) =>
              <span key={idx} className="rounded-md bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2.5 py-1 text-[10px] font-bold">
                  {allergy}
                </span>
              )}
            </div>
          </div>

          {/* Latest Vitals */}
          {patient.vitals &&
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <span className="text-xs uppercase font-extrabold text-slate-900 dark:text-slate-50 tracking-wider">{t("doctor.latest_vital_signs")}</span>
                <span className="text-[10px] text-slate-400 font-medium">{t("doctor.as_of")}{patient.vitals.updatedAt}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">{t("doctor.blood_pressure")}</span>
                  <span className="text-sm font-black text-slate-950 dark:text-slate-50">{patient.vitals.bloodPressure}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">{t("doctor.heart_rate")}</span>
                  <span className="text-sm font-black text-slate-950 dark:text-slate-50">{patient.vitals.heartRate}{t("doctor.bpm")}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">{t("doctor.temperature")}</span>
                  <span className="text-sm font-black text-slate-950 dark:text-slate-50">{patient.vitals.temperature}{t("doctor.f")}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">{t("doctor.weight")}</span>
                  <span className="text-sm font-black text-slate-950 dark:text-slate-50">{patient.vitals.weight}{t("doctor.kg")}</span>
                </div>
              </div>
            </div>
          }
        </div>

        {/* Right Column: Timeline and Lab Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical History Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-6 uppercase tracking-wider">{t("doctor.clinical_consultations_timeline")}</h3>
            <div className="relative border-l border-slate-150 dark:border-slate-800 pl-5 space-y-6 ml-2.5">
              {patient.medicalHistory?.map((hist, idx) =>
              <div key={idx} className="relative">
                  <div className="absolute -left-[30px] top-1 h-4.5 w-4.5 rounded-full border-4 border-white bg-blue-500 dark:border-slate-900" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-450 font-bold bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md">
                      {hist.date}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-1">{hist.condition}</h4>
                    <p className="text-[11px] font-semibold text-slate-650 dark:text-slate-400">{t("doctor.treatment")}{hist.treatment}</p>
                    {hist.notes &&
                  <p className="text-[10px] text-slate-400 leading-relaxed italic mt-0.5">{t("doctor.clinical_note")}{hist.notes}</p>
                  }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lab Reports Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-6 uppercase tracking-wider">{t("doctor.diagnostic_lab_results")}</h3>
            <div className="space-y-3.5">
              {patient.labReports?.map((rep) =>
              <div key={rep.reportId} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4.5 w-4.5 text-slate-400" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">{rep.reportName}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{rep.labName} &bull; {rep.testDate}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1 text-[9px] font-bold capitalize">
                      {rep.status}
                    </span>
                  </div>

                  {rep.results &&
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg text-[10px] font-bold text-slate-650 dark:text-slate-400">
                      {Object.entries(rep.results).map(([key, val]) =>
                  <div key={key} className="flex justify-between pr-4">
                          <span>{key}</span>
                          <span className="text-slate-900 dark:text-slate-200 font-extrabold">{val}</span>
                        </div>
                  )}
                    </div>
                }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}