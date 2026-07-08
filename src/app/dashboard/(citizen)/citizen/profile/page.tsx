'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '@/providers/AuthProvider';
import { useCitizenProfile, useUpdateProfileMutation } from '@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';
import { icons } from '@/design-system/icons';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';


// Form validation schema
const profileSchema = zod.object({
  fullName: zod.string().min(2, 'Name must be at least 2 characters.'),
  age: zod.number().min(0).max(120, 'Please enter a valid age.'),
  gender: zod.enum(['male', 'female', 'other']),
  bloodGroup: zod.string().min(1, 'Please select your blood group.'),
  allergies: zod.string(), // comma separated
  emergencyContact: zod.string().min(10, 'Emergency contact should be a valid phone number.')
});

type ProfileFormValues = zod.infer<typeof profileSchema>;

export default function CitizenProfilePage() {const { t } = useLanguage();
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Queries
  const { data: profile, isLoading } = useCitizenProfile(uid);
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      age: 0,
      gender: 'other',
      bloodGroup: '',
      allergies: '',
      emergencyContact: ''
    }
  });

  // Sync data to react-hook-form on load
  React.useEffect(() => {
    if (profile) {
      setValue('fullName', profile.fullName || '');
      setValue('age', profile.age || 0);
      setValue('gender', profile.gender || 'other');
      setValue('bloodGroup', profile.bloodGroup || '');
      setValue('allergies', profile.allergies ? profile.allergies.join(', ') : '');
      setValue('emergencyContact', profile.emergencyContact || '');
    }
  }, [profile, setValue]);

  const onSubmit = async (values: ProfileFormValues) => {
    // Split allergies by comma
    const allergiesList = values.allergies.
    split(',').
    map((a) => a.trim()).
    filter(Boolean);

    await updateProfileMutation.mutateAsync({
      uid,
      data: {
        fullName: values.fullName,
        age: values.age,
        gender: values.gender,
        bloodGroup: values.bloodGroup,
        allergies: allergiesList,
        emergencyContact: values.emergencyContact
      }
    });
  };

  if (isLoading) {
    return <LoadingState variant="table" rows={5} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8">
      
      <PageHeader
        title={t("citizen.medical_identity_card")}
        description={t("citizen.keep_your_personal_medical_and_emergency_contact_details_synced_to_firestore")} />
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Placeholder */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-center space-y-4">
            <div className="relative mx-auto h-24 w-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-3xl uppercase">
              {user?.fullName?.slice(0, 2) || 'US'}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-50">{user?.fullName}</h4>
              <p className="text-xs text-slate-450">{user?.email}</p>
            </div>

            {/* Photo upload placeholder */}
            <div className="border border-dashed border-slate-250 dark:border-slate-850 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/20 text-center cursor-pointer hover:bg-slate-100/50 transition">
              <icons.UploadCloud className="h-5 w-5 text-slate-400 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-slate-500">{t("citizen.upload_identity_photo")}</p>
              <p className="text-[9px] text-slate-400">{t("citizen.max_size_2mb_jpgpng_format")}</p>
            </div>
          </div>
        </div>

        {/* Profile Details Edit Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
            
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-3">{t("citizen.personal_medical_details")}

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.full_name")}</label>
                <Input
                  type="text"
                  {...register('fullName')}
                  className={cn(
                    componentStyles.input.base,
                    errors.fullName ? 'border-red-500 focus:ring-red-200' : ''
                  )} />
                
                {errors.fullName &&
                <p className="text-[10px] text-red-500 font-bold">{errors.fullName.message}</p>
                }
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.age")}</label>
                <Input
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                  className={cn(
                    componentStyles.input.base,
                    errors.age ? 'border-red-500 focus:ring-red-200' : ''
                  )} />
                
                {errors.age &&
                <p className="text-[10px] text-red-500 font-bold">{errors.age.message}</p>
                }
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.gender")}</label>
                <select
                  {...register('gender')}
                  className={cn(
                    componentStyles.input.base,
                    errors.gender ? 'border-red-500 focus:ring-red-200' : ''
                  )}>
                  
                  <option value="male">{t("citizen.male")}</option>
                  <option value="female">{t("citizen.female")}</option>
                  <option value="other">{t("citizen.other")}</option>
                </select>
                {errors.gender &&
                <p className="text-[10px] text-red-500 font-bold">{errors.gender.message}</p>
                }
              </div>

              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.blood_group")}</label>
                <select
                  {...register('bloodGroup')}
                  className={cn(
                    componentStyles.input.base,
                    errors.bloodGroup ? 'border-red-500 focus:ring-red-200' : ''
                  )}>
                  
                  <option value="">{t("citizen.select_blood_group")}</option>
                  <option value="A+">{t("citizen.a")}</option>
                  <option value="A-">{t("citizen.a_")}</option>
                  <option value="B+">{t("citizen.b")}</option>
                  <option value="B-">{t("citizen.b_")}</option>
                  <option value="AB+">{t("citizen.ab")}</option>
                  <option value="AB-">{t("citizen.ab_")}</option>
                  <option value="O+">{t("citizen.o")}</option>
                  <option value="O-">{t("citizen.o_")}</option>
                </select>
                {errors.bloodGroup &&
                <p className="text-[10px] text-red-500 font-bold">{errors.bloodGroup.message}</p>
                }
              </div>

              {/* Allergies */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.allergies_comma_separated")}</label>
                <Input
                  type="text"
                  placeholder={t("citizen.eg_penicillin_pollen_peanuts")}
                  {...register('allergies')}
                  className={cn(
                    componentStyles.input.base,
                    errors.allergies ? 'border-red-500 focus:ring-red-200' : ''
                  )} />
                
                {errors.allergies &&
                <p className="text-[10px] text-red-500 font-bold">{errors.allergies.message}</p>
                }
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.emergency_contact_phone")}</label>
                <Input
                  type="tel"
                  {...register('emergencyContact')}
                  className={cn(
                    componentStyles.input.base,
                    errors.emergencyContact ? 'border-red-500 focus:ring-red-200' : ''
                  )} />
                
                {errors.emergencyContact &&
                <p className="text-[10px] text-red-500 font-bold">{errors.emergencyContact.message}</p>
                }
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || updateProfileMutation.isPending}
                className={cn(
                  componentStyles.button.base,
                  componentStyles.button.primary,
                  'px-6 py-2.5 disabled:opacity-50'
                )}>
                
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>);

}