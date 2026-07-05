'use client';

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

// Form validation schema
const profileSchema = zod.object({
  fullName: zod.string().min(2, 'Name must be at least 2 characters.'),
  age: zod.number().min(0).max(120, 'Please enter a valid age.'),
  gender: zod.enum(['male', 'female', 'other']),
  bloodGroup: zod.string().min(1, 'Please select your blood group.'),
  allergies: zod.string(), // comma separated
  emergencyContact: zod.string().min(10, 'Emergency contact should be a valid phone number.'),
});

type ProfileFormValues = zod.infer<typeof profileSchema>;

export default function CitizenProfilePage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Queries
  const { data: profile, isLoading } = useCitizenProfile(uid);
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      age: 0,
      gender: 'other',
      bloodGroup: '',
      allergies: '',
      emergencyContact: '',
    },
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
    const allergiesList = values.allergies
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    await updateProfileMutation.mutateAsync({
      uid,
      data: {
        fullName: values.fullName,
        age: values.age,
        gender: values.gender,
        bloodGroup: values.bloodGroup,
        allergies: allergiesList,
        emergencyContact: values.emergencyContact,
      },
    });
  };

  if (isLoading) {
    return <LoadingState variant="table" rows={5} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <PageHeader
        title="Medical Identity Card"
        description="Keep your personal, medical, and emergency contact details synced to Firestore."
      />

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
              <p className="text-[10px] font-bold text-slate-500">Upload Identity Photo</p>
              <p className="text-[9px] text-slate-400">Max size 2MB, JPG/PNG format</p>
            </div>
          </div>
        </div>

        {/* Profile Details Edit Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-3">
              Personal & Medical Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Full Name</label>
                <input
                  type="text"
                  {...register('fullName')}
                  className={cn(
                    componentStyles.input.base,
                    errors.fullName ? 'border-red-500 focus:ring-red-200' : ''
                  )}
                />
                {errors.fullName && (
                  <p className="text-[10px] text-red-500 font-bold">{errors.fullName.message}</p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Age</label>
                <input
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                  className={cn(
                    componentStyles.input.base,
                    errors.age ? 'border-red-500 focus:ring-red-200' : ''
                  )}
                />
                {errors.age && (
                  <p className="text-[10px] text-red-500 font-bold">{errors.age.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Gender</label>
                <select
                  {...register('gender')}
                  className={cn(
                    componentStyles.input.base,
                    errors.gender ? 'border-red-500 focus:ring-red-200' : ''
                  )}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-[10px] text-red-500 font-bold">{errors.gender.message}</p>
                )}
              </div>

              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Blood Group</label>
                <select
                  {...register('bloodGroup')}
                  className={cn(
                    componentStyles.input.base,
                    errors.bloodGroup ? 'border-red-500 focus:ring-red-200' : ''
                  )}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                {errors.bloodGroup && (
                  <p className="text-[10px] text-red-500 font-bold">{errors.bloodGroup.message}</p>
                )}
              </div>

              {/* Allergies */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500">Allergies (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Pollen, Peanuts"
                  {...register('allergies')}
                  className={cn(
                    componentStyles.input.base,
                    errors.allergies ? 'border-red-500 focus:ring-red-200' : ''
                  )}
                />
                {errors.allergies && (
                  <p className="text-[10px] text-red-500 font-bold">{errors.allergies.message}</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500">Emergency Contact Phone</label>
                <input
                  type="tel"
                  {...register('emergencyContact')}
                  className={cn(
                    componentStyles.input.base,
                    errors.emergencyContact ? 'border-red-500 focus:ring-red-200' : ''
                  )}
                />
                {errors.emergencyContact && (
                  <p className="text-[10px] text-red-500 font-bold">{errors.emergencyContact.message}</p>
                )}
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
                )}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
