'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalProfile,
  useUpdateHospitalProfileMutation } from
'@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { Save, ShieldAlert, Landmark } from 'lucide-react';
import { toast } from '@/components/ui/toast';

const settingsSchema = zod.object({
  hospitalName: zod.string().min(2, 'Name must be at least 2 characters'),
  address: zod.string().min(5, 'Address must be at least 5 characters'),
  phone: zod.string().min(10, 'Provide a valid phone number'),
  email: zod.string().email('Provide a valid email address'),
  emergencyThreshold: zod.number().min(1).max(100, 'Threshold must be between 1 and 100'),
  generalThreshold: zod.number().min(1).max(100, 'Threshold must be between 1 and 100')
});

type SettingsFormValues = zod.infer<typeof settingsSchema>;

export default function HospitalSettingsPage() {const { t } = useLanguage();
  const hospitalId = 'hosp_city_gen';
  const { data: profile, isLoading } = useHospitalProfile(hospitalId);
  const updateMutation = useUpdateHospitalProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema)
  });

  useEffect(() => {
    if (profile) {
      reset({
        hospitalName: profile.hospitalName,
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        emergencyThreshold: profile.emergencyThreshold || 80,
        generalThreshold: profile.generalThreshold || 90
      });
    }
  }, [profile, reset]);

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateMutation.mutateAsync({
        hospitalId,
        data: values
      });
      toast.success(t("hospital.hospital_settings_profile_updated_successfully"));
    } catch {
      toast.error(t("hospital.failed_to_update_hospital_settings"));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={t("hospital.settings_profile")}
        description={t("hospital.configure_emergency_room_capacity_warnings_update_facility_contact_directories_and_inspect_telemetry_options")} />
      

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xs font-semibold">
        {/* Core Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Landmark className="h-5 w-5 text-slate-450" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-bold">{t("hospital.facility_profile")}</h3>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-350 mb-1">{t("hospital.hospital_name")}</label>
            <input
              type="text"
              {...register('hospitalName')}
              className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
            
            {errors.hospitalName && <p className="text-red-500 mt-1 font-bold">{errors.hospitalName.message}</p>}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-350 mb-1">{t("hospital.street_address")}</label>
            <input
              type="text"
              {...register('address')}
              className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
            
            {errors.address && <p className="text-red-500 mt-1 font-bold">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-350 mb-1">{t("hospital.phone_number")}</label>
              <input
                type="text"
                {...register('phone')}
                className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
              
              {errors.phone && <p className="text-red-500 mt-1 font-bold">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-350 mb-1">{t("hospital.admin_email_address")}</label>
              <input
                type="email"
                {...register('email')}
                className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
              
              {errors.email && <p className="text-red-500 mt-1 font-bold">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Operating Limits */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-5 w-5 text-slate-450" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 font-bold">{t("hospital.operational_alarm_thresholds")}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-350 mb-1">{t("hospital.icu_alarm_threshold")}</label>
              <input
                type="number"
                {...register('emergencyThreshold', { valueAsNumber: true })}
                className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
              
              {errors.emergencyThreshold && <p className="text-red-500 mt-1 font-bold">{errors.emergencyThreshold.message}</p>}
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-350 mb-1">{t("hospital.general_ward_alarm_threshold")}</label>
              <input
                type="number"
                {...register('generalThreshold', { valueAsNumber: true })}
                className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
              
              {errors.generalThreshold && <p className="text-red-500 mt-1 font-bold">{errors.generalThreshold.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-5 py-3 flex items-center gap-2 cursor-pointer transition shadow-md">
            
            <Save className="h-4 w-4" />
            <span>{updateMutation.isPending ? 'Saving Settings...' : 'Save Facility Profile'}
            </span>
          </button>
        </div>
      </form>
    </div>);

}