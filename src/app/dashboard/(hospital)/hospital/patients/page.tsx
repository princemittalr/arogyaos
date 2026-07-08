'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useHospitalPatients } from '@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { motion } from 'framer-motion';
import { Search, Heart, User } from 'lucide-react';
import { Input } from '@/components/ui/input';


export default function PatientsDirectoryPage() {const { t } = useLanguage();
  const hospitalId = 'hosp_city_gen';
  const { data: patients, isLoading } = useHospitalPatients(hospitalId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const filtered = patients?.filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospital.patient_directory")}
        description={t("hospital.inspect_demographic_info_current_clinical_statuses_and_detailed_admission_statuses_of_active_citizens")} />
      

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder={t("hospital.search_patients")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-transparent rounded-xl text-xs font-bold text-slate-750 dark:border-slate-800 focus:outline-none" />
          
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none">
          
          <option value="">{t("hospital.all_statuses")}</option>
          <option value="admitted">{t("hospital.admitted")}</option>
          <option value="outpatient">{t("hospital.outpatient")}</option>
          <option value="discharged">{t("hospital.discharged")}</option>
        </select>
      </div>

      {/* Grid of Patients */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ?
        <p className="text-center text-xs text-slate-500 py-10 col-span-full">{t("hospital.no_patient_records_found")}</p> :

        filtered.map((p) =>
        <motion.div
          key={p.patientId}
          layout
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-xs uppercase">
                    {p.fullName.slice(0, 2)}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
              p.status === 'admitted' ?
              'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400' :
              'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'}`
              }>
                    {p.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                    {p.fullName}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-bold">{p.email}</p>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px] font-bold text-slate-500">
                  <div className="flex justify-between">
                    <span>{t("hospital.age_gender")}</span>
                    <span className="text-slate-850 dark:text-slate-350 capitalize">{p.age}{t("hospital.years")}{p.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("hospital.blood_group")}</span>
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-0.5"><Heart className="h-3 w-3 fill-red-500 stroke-red-500" /> {p.bloodGroup}</span>
                  </div>

                  {p.status === 'admitted' &&
              <div className="mt-3 p-2.5 rounded-xl bg-red-50/30 border border-red-100/50 dark:bg-slate-950/40 dark:border-slate-850 space-y-1">
                      <p className="text-[9px] font-bold text-red-650 dark:text-red-400 uppercase tracking-wide">{t("hospital.admission_info")}</p>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-400">{t("hospital.admitted")}</span>
                        <span className="text-slate-650 dark:text-slate-300">{p.admissionDate}</span>
                      </div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-400">{t("hospital.room_bed")}</span>
                        <span className="text-slate-650 dark:text-slate-300">{t("hospital.room")}{p.roomNumber}{t("hospital.bed")}{p.bedNumber}</span>
                      </div>
                    </div>
              }
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[9px] text-slate-400 font-bold">
                <span>{t("hospital.citizen_id")}{p.patientId.slice(0, 8)}</span>
                <span className="flex items-center gap-0.5"><User className="h-3 w-3" />{t("hospital.profile_sync")}</span>
              </div>
            </motion.div>
        )
        }
      </div>
    </div>);

}