'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useForm } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { useDoctorProfile, useUpdateDoctorProfileMutation } from '@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = zod.object({
  fullName: zod.string().min(3, 'Full name is required'),
  specialization: zod.string().min(2, 'Specialization is required'),
  qualification: zod.string().min(2, 'Qualification details are required'),
  consultationFee: zod.number().min(0, 'Consultation fee must be positive')
});

type ProfileFormValues = zod.infer<typeof profileSchema>;

export default function DoctorProfilePage() {const { t } = useLanguage();
  const { user } = useAuth();
  const doctorId = user?.uid || 'doc_arav_mehta';

  const { data: profile, isLoading } = useDoctorProfile(doctorId);
  const updateMutation = useUpdateDoctorProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.fullName || '',
      specialization: profile?.specialization || '',
      qualification: profile?.qualification || '',
      consultationFee: profile?.consultationFee || 500
    }
  });

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateMutation.mutateAsync({
        doctorId,
        data: values
      });
    } catch {
      toast.error(t("doctor.failed_to_commit_profile_updates"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("doctor.doctor_professional_profile")}
        description={t("doctor.verify_your_clinical_credentials_specialization_registry_and_outpatient_consultation_fees")} />
      

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-3xl">
              {profile?.fullName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-slate-50">{t("doctor.dr")}{profile?.fullName}</h3>
              <p className="text-[11px] font-bold text-slate-450 uppercase tracking-wider mt-0.5">{profile?.specialization}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold text-slate-650 dark:text-slate-400 space-y-2.5 pt-3">
            <div className="flex justify-between py-1.5 first:pt-0">
              <span>{t("doctor.department_id")}</span>
              <span className="text-slate-850 dark:text-slate-100">{profile?.departmentId}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>{t("doctor.hospital_id")}</span>
              <span className="text-slate-850 dark:text-slate-100">{profile?.hospitalId}</span>
            </div>
          </div>
        </div>

        {/* Edit Credentials Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-3 mb-6 uppercase tracking-wider">{t("doctor.edit_credentials_details")}

          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">{t("doctor.full_name")}</label>
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
                
                {errors.fullName &&
                <p className="text-[10px] text-red-500 font-semibold">{errors.fullName.message}</p>
                }
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">{t("doctor.specialization")}</label>
                <input
                  type="text"
                  {...register('specialization')}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
                
                {errors.specialization &&
                <p className="text-[10px] text-red-500 font-semibold">{errors.specialization.message}</p>
                }
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">{t("doctor.qualifications")}</label>
                <input
                  type="text"
                  {...register('qualification')}
                  placeholder={t("doctor.mbbs_md")}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
                
                {errors.qualification &&
                <p className="text-[10px] text-red-500 font-semibold">{errors.qualification.message}</p>
                }
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">{t("doctor.consultation_fee")}</label>
                <input
                  type="number"
                  {...register('consultationFee', { valueAsNumber: true })}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
                
                {errors.consultationFee &&
                <p className="text-[10px] text-red-500 font-semibold">{errors.consultationFee.message}</p>
                }
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5">
                
                <Save className="h-4 w-4" />{t("doctor.save_professional_changes")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>);

}