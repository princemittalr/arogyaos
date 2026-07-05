'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { registerFormSchema } from '@/utils/validators';
import { RegisterFormValues } from '../types';
import { useAuthActions } from '../hooks/useAuthActions';
import { UserRole } from '@/config/roles';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';

export function RegisterForm() {
  const { register: registerUser, loginWithGoogle, isRegistering, isGoogleLoggingIn } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'citizen',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser({
        email: data.email,
        fullName: data.fullName,
        role: data.role as UserRole,
        password: data.password,
      });
    } catch {
      // Handled in actions hook
    }
  };

  const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
    </svg>
  );

  const Spinner = icons.Loader2;
  const isLoading = isRegistering || isGoogleLoggingIn;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Create Account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Register to join the ArogyaOS healthcare network
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${componentStyles.card.base} p-8`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Full Name
            </label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="e.g. Rahul Sharma"
              className={`${componentStyles.input.base} ${errors.fullName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              disabled={isLoading}
              placeholder="e.g. rahul@arogya.in"
              className={`${componentStyles.input.base} ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Healthcare Role
            </label>
            <select
              disabled={isLoading}
              className={`${componentStyles.input.base} ${errors.role ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('role')}
            >
              <option value="citizen">Citizen (Patient)</option>
              <option value="doctor">Doctor (Consultant)</option>
              <option value="hospital_admin">Hospital Administrator</option>
              <option value="district_admin">District Health Officer</option>
            </select>
            {errors.role && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              disabled={isLoading}
              placeholder="••••••••"
              className={`${componentStyles.input.base} ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Confirm Password
            </label>
            <input
              type="password"
              disabled={isLoading}
              placeholder="••••••••"
              className={`${componentStyles.input.base} ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-2`}
          >
            {isRegistering ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}
            Register Profile
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">
              Or register with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => loginWithGoogle()}
          className={`${componentStyles.button.base} ${componentStyles.button.outline} w-full py-3.5`}
        >
          {isGoogleLoggingIn ? (
            <Spinner className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <GoogleIcon />
          )}
          Google Workplace
        </button>
      </motion.div>

      <div className="text-center text-sm text-slate-500">
        Already have a profile?{' '}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
export default RegisterForm;
