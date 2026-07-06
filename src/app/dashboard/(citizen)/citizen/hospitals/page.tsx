'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useHospitals, useDoctors } from '@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState, SearchBar, FilterBar, EmptyState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';
import { icons } from '@/design-system/icons';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

export default function CitizenHospitalsPage() {const { t } = useLanguage();
  const router = useRouter();

  // Queries
  const { data: hospitals, isLoading: hospLoading } = useHospitals();
  const { data: doctors, isLoading: docsLoading } = useDoctors();

  // Local Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);

  const isLoading = hospLoading || docsLoading;

  if (isLoading) {
    return <LoadingState variant="table" rows={5} />;
  }

  // Filter list
  const filteredHospitals = hospitals?.filter((h) => {
    const matchesSearch = h.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict ? h.districtId === selectedDistrict : true;
    return matchesSearch && matchesDistrict;
  });

  const selectedHospDetails = hospitals?.find((h) => h.hospitalId === selectedHospital);
  const hospDoctors = doctors?.filter((d) => d.hospitalId === selectedHospital);

  // Mocked details for specific hospitals to make it production grade
  const mockHospitalCapacity: Record<string, {icuBeds: number;generalBeds: number;departments: string[];rating: number;tests: string[];}> = {
    hosp_city_gen: {
      icuBeds: 8,
      generalBeds: 24,
      departments: ['Cardiology', 'Neurology', 'General Medicine'],
      rating: 4.8,
      tests: ['CBC Blood Test', 'ECG Heart Check', 'Chest X-Ray']
    },
    hosp_st_marys: {
      icuBeds: 4,
      generalBeds: 18,
      departments: ['Pediatrics', 'Obstetrics', 'Gynaecology'],
      rating: 4.5,
      tests: ['Pediatric Profile', 'Ultrasound Imaging']
    },
    hosp_arogya: {
      icuBeds: 6,
      generalBeds: 15,
      departments: ['Dermatology', 'Orthopedics', 'Physiotherapy'],
      rating: 4.9,
      tests: ['Skin Allergy Patch Test', 'Bone Density scan']
    }
  };

  const currentCapacity = selectedHospital ?
  mockHospitalCapacity[selectedHospital] || {
    icuBeds: 3,
    generalBeds: 10,
    departments: ['General OPD'],
    rating: 4.2,
    tests: ['Basic Blood Check']
  } :
  null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8">
      
      <PageHeader
        title={t("citizen.verified_medical_facilities")}
        description={t("citizen.search_real_time_diagnostic_laboratories_emergency_care_hubs_and_local_government_dispensaries")} />
      

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={t("citizen.search_facility_registry")} />
        <FilterBar
          options={[
          {
            key: 'district',
            label: t("citizen.filter_by_location"),
            choices: [
            { label: t("citizen.bengaluru"), value: 'dist_bengaluru' },
            { label: t("citizen.chennai"), value: 'dist_chennai' },
            { label: t("citizen.hyderabad"), value: 'dist_hyderabad' }]

          }]
          }
          selectedFilters={{ district: selectedDistrict }}
          onChange={(_, val) => setSelectedDistrict(val)}
          onClearAll={() => setSelectedDistrict('')} />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Hospital List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredHospitals && filteredHospitals.length > 0 ?
          filteredHospitals.map((h) => {
            const capacity = mockHospitalCapacity[h.hospitalId] || { icuBeds: 3, generalBeds: 10, rating: 4.0 };
            const isSelected = selectedHospital === h.hospitalId;

            return (
              <div
                key={h.hospitalId}
                onClick={() => setSelectedHospital(h.hospitalId)}
                className={cn(
                  componentStyles.card.base,
                  'p-5 cursor-pointer transition border-2 flex flex-col sm:flex-row justify-between items-start gap-4',
                  isSelected ?
                  'border-blue-600 dark:border-blue-500 bg-blue-50/10 dark:bg-blue-950/10' :
                  'border-transparent hover:border-slate-350 dark:hover:border-slate-700'
                )}>
                
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-2.5 text-blue-600 dark:text-blue-400">
                        <icons.Building className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">{h.hospitalName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{h.address}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs font-semibold pt-1">
                      <span className="text-slate-500">{t("citizen.icu_beds")}
                      <span className="text-slate-800 dark:text-slate-200">{capacity.icuBeds}{t("citizen.free")}</span>
                      </span>
                      <span className="text-slate-500">{t("citizen.general")}
                      <span className="text-slate-800 dark:text-slate-200">{capacity.generalBeds}{t("citizen.free")}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full self-start sm:self-center">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{capacity.rating}</span>
                  </div>
                </div>);

          }) :

          <EmptyState
            title={t("citizen.no_facilities_found")}
            description={t("citizen.refine_your_keyword_search_or_change_the_location_filter_options")}
            icon={icons.Building || icons.Home} />

          }
        </div>

        {/* Right Side: Hospital Details Card */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedHospDetails && currentCapacity ?
            <motion.div
              key={selectedHospital}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6 sticky top-24">
              
                <div>
                  <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-50">
                    {selectedHospDetails.hospitalName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{selectedHospDetails.address}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold">{t("citizen.clinic_rating")}</span>
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) =>
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.floor(currentCapacity.rating) ? 'fill-current' : ''
                    )} />

                  )}
                  </div>
                  <span className="font-bold">({currentCapacity.rating})</span>
                </div>

                {/* Beds availability */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">{t("citizen.bed_status")}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                      <span className="text-[10px] font-semibold text-slate-450 block">{t("citizen.icu_beds")}</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {currentCapacity.icuBeds}{t("citizen.available")}
                    </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                      <span className="text-[10px] font-semibold text-slate-450 block">{t("citizen.general_ward")}</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {currentCapacity.generalBeds}{t("citizen.available")}
                    </span>
                    </div>
                  </div>
                </div>

                {/* Departments list */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">{t("citizen.departments")}</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCapacity.departments.map((dept) =>
                  <span
                    key={dept}
                    className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-950/30 dark:text-blue-450 font-bold">
                    
                        {dept}
                      </span>
                  )}
                  </div>
                </div>

                {/* Tests available */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">{t("citizen.available_tests")}</h5>
                  <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {currentCapacity.tests.map((test) =>
                  <li key={test}>{test}</li>
                  )}
                  </ul>
                </div>

                {/* Doctors list */}
                <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">{t("citizen.available_specialists")}

                </h5>
                  <div className="space-y-2">
                    {hospDoctors && hospDoctors.length > 0 ?
                  hospDoctors.map((docObj) =>
                  <div key={docObj.uid} className="flex justify-between items-center text-xs py-0.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {docObj.doctorName}
                          </span>
                          <span className="text-slate-500">{docObj.specialization}</span>
                        </div>
                  ) :

                  <p className="text-xs text-slate-450">{t("citizen.no_doctors_listed")}</p>
                  }
                  </div>
                </div>

                {/* Book Button */}
                <button
                onClick={() => router.push(`/dashboard/citizen/book?hospitalId=${selectedHospital}`)}
                className={cn(
                  componentStyles.button.base,
                  componentStyles.button.primary,
                  'w-full py-2.5 font-bold text-xs'
                )}>{t("citizen.book_appointment")}


              </button>
              </motion.div> :

            <div className="rounded-2xl border border-dashed border-slate-200 p-6 dark:border-slate-800 text-center py-16 text-slate-400">
                <icons.ArrowLeftRight className="h-8 w-8 mx-auto mb-3" />
                <p className="text-xs font-semibold">{t("citizen.select_a_medical_facility_to_view_bed_counts_and_specialty_clinics")}</p>
              </div>
            }
          </AnimatePresence>
        </div>
      </div>
    </motion.div>);

}