'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useDoctors } from '@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState, SearchBar, FilterBar, EmptyState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';
import { icons } from '@/design-system/icons';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CitizenDoctorsPage() {const { t } = useLanguage();
  const router = useRouter();

  // Queries
  const { data: doctors, isLoading } = useDoctors();

  // Local Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState variant="table" rows={5} />;
  }

  // Filter list
  const filteredDoctors = doctors?.filter((d) => {
    const matchesSearch = d.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty ? d.specialization === selectedSpecialty : true;
    return matchesSearch && matchesSpecialty;
  });

  const selectedDocDetails = doctors?.find((d) => d.uid === selectedDocId);

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8">
      
      <PageHeader
        title={t("citizen.consultant_specialists")}
        description={t("citizen.connect_with_qualified_practitioners_check_real_time_availability_slots_and_book_visits")} />
      

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={t("citizen.search_doctor_directory")} />
        <FilterBar
          options={[
          {
            key: 'specialty',
            label: t("citizen.filter_by_specialty"),
            choices: [
            { label: t("citizen.cardiologist"), value: 'Cardiologist' },
            { label: t("citizen.pediatrician"), value: 'Pediatrician' },
            { label: t("citizen.dermatologist"), value: 'Dermatologist' }]

          }]
          }
          selectedFilters={{ specialty: selectedSpecialty }}
          onChange={(_, val) => setSelectedSpecialty(val)}
          onClearAll={() => setSelectedSpecialty('')} />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Doctors Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors && filteredDoctors.length > 0 ?
          filteredDoctors.map((d) => {
            const isSelected = selectedDocId === d.uid;

            return (
              <div
                key={d.uid}
                onClick={() => setSelectedDocId(d.uid)}
                className={cn(
                  componentStyles.card.base,
                  'p-5 cursor-pointer transition border-2 flex flex-col justify-between gap-4',
                  isSelected ?
                  'border-blue-600 dark:border-blue-500 bg-blue-50/10 dark:bg-blue-950/10' :
                  'border-transparent hover:border-slate-350 dark:hover:border-slate-700'
                )}>
                
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-650 to-indigo-500 text-white font-bold text-sm uppercase">
                        {d.doctorName.replace('Dr. ', '').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">{d.doctorName}</h4>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 block">
                          {d.specialization}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-slate-500 font-medium">{t("citizen.facility")}
                      <span className="text-slate-800 dark:text-slate-200">{d.hospitalName}</span>
                      </p>
                      <p className="text-slate-500 font-medium">{t("citizen.consultation_fee")}
                      <span className="text-slate-800 dark:text-slate-200">₹{d.consultationFee}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline self-end">{t("citizen.check_slots")}

                </span>
                </div>);

          }) :

          <div className="col-span-full">
              <EmptyState
              title={t("citizen.no_doctors_found")}
              description={t("citizen.refine_your_keyword_search_or_change_the_specialty_filter_options")}
              icon={icons.User || icons.Home} />
            
            </div>
          }
        </div>

        {/* Right Side: Doctor Profile Details Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedDocDetails ?
            <motion.div
              key={selectedDocId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6 sticky top-24">
              
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-xl uppercase">
                    {selectedDocDetails.doctorName.replace('Dr. ', '').slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
                      {selectedDocDetails.doctorName}
                    </h4>
                    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 font-bold mt-1">
                      {selectedDocDetails.specialization}
                    </span>
                  </div>
                </div>

                {/* Info Card List */}
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-semibold">{t("citizen.qualifications")}</span>
                    <span className="text-slate-900 dark:text-slate-250 font-bold">
                      {selectedDocDetails.qualification}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-semibold">{t("citizen.clinic_center")}</span>
                    <span className="text-slate-900 dark:text-slate-250 font-bold">
                      {selectedDocDetails.hospitalName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-semibold">{t("citizen.opd_fee")}</span>
                    <span className="text-slate-900 dark:text-slate-250 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{selectedDocDetails.consultationFee}
                    </span>
                  </div>
                </div>

                {/* Available slots list */}
                <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">{t("citizen.opd_scheduling_hours")}

                </h5>
                  <div className="space-y-1.5">
                    {selectedDocDetails.availability.map((slot, idx) =>
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                    
                        <span className="font-bold text-slate-800 dark:text-slate-250">
                          {daysMap[slot.dayOfWeek]}
                        </span>
                        <span className="text-slate-500">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                  )}
                  </div>
                </div>

                {/* Book Button */}
                <button
                onClick={() =>
                router.push(
                  `/dashboard/citizen/book?doctorId=${selectedDocId}&hospitalId=${selectedDocDetails.hospitalId}`
                )
                }
                className={cn(
                  componentStyles.button.base,
                  componentStyles.button.primary,
                  'w-full py-2.5 font-bold text-xs'
                )}>{t("citizen.book_appointment")}


              </button>
              </motion.div> :

            <div className="rounded-2xl border border-dashed border-slate-200 p-6 dark:border-slate-800 text-center py-16 text-slate-400">
                <icons.Bot className="h-8 w-8 mx-auto mb-3" />
                <p className="text-xs font-semibold">{t("citizen.select_a_consultant_profile_to_check_slots_and_fees_details")}</p>
              </div>
            }
          </AnimatePresence>
        </div>
      </div>
    </motion.div>);

}