'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDoctorPatients } from '@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import { Search, Eye, User } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';


export default function PatientsDirectoryPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const uid = user?.uid || 'doc_arav_mehta';

  const { data: patients, isLoading } = useDoctorPatients(uid);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  // Filter logic
  const filteredPatients = patients?.filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = selectedGender === 'all' || p.gender === selectedGender;
    return matchesSearch && matchesGender;
  }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("doctor.electronic_medical_records_emr")}
        description={t("doctor.inspect_medical_history_archives_vital_tracking_metrics_and_past_prescriptions_for_assigned_patients")} />
      

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder={t("doctor.search_patients_by_name_or_email")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-transparent dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none" />
          
        </div>

        <div className="flex gap-2">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none">
            
            <option value="all">{t("doctor.all_genders")}</option>
            <option value="male">{t("doctor.male")}</option>
            <option value="female">{t("doctor.female")}</option>
            <option value="other">{t("doctor.other")}</option>
          </select>
        </div>
      </div>

      {/* Patients List Grid */}
      {filteredPatients.length === 0 ?
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <User className="h-10 w-10 text-slate-350 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("doctor.no_patients_found")}</p>
          <p className="text-xs text-slate-450 mt-1">{t("doctor.try_refining_your_search_terms_or_filters")}</p>
        </div> :

      <div className="grid gap-6 md:grid-cols-3">
          {filteredPatients.map((patient) =>
        <div
          key={patient.uid}
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
          
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-xs">
                    {patient.fullName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{patient.fullName}</h4>
                    <p className="text-[10px] text-slate-450 font-semibold">{patient.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-[10px] font-bold text-slate-650 dark:text-slate-400">
                  <p>{t("doctor.age")}{patient.age}{t("doctor.years")}</p>
                  <p className="capitalize">{t("doctor.gender")}{patient.gender}</p>
                  <p>{t("doctor.blood_group")}{patient.bloodGroup}</p>
                  <p>{t("doctor.allergies")}{patient.allergies?.length || 0}{t("doctor.noted")}</p>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                <Link
              href={`/dashboard/doctor/patient/${patient.uid}`}
              className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 py-2 text-center text-[10px] font-bold text-slate-650 dark:text-slate-300 flex items-center justify-center gap-1">
              
                  <Eye className="h-3.5 w-3.5" />{t("doctor.view_emr_case")}
            </Link>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

}