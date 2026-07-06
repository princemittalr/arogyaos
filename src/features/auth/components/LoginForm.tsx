'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { loginFormSchema } from '@/utils/validators';
import { LoginFormValues } from '../types';
import { useAuthActions } from '../hooks/useAuthActions';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';

export function LoginForm() {const { t } = useLanguage();
  const { login, loginWithGoogle, isLoggingIn, isGoogleLoggingIn } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
    } catch {

      // Toast notifications are already dispatched in hooks onSuccess/onError
    }};

  const GoogleIcon = () =>
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
    </svg>;


  const Spinner = icons.Loader2;

  const isLoading = isLoggingIn || isGoogleLoggingIn;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t("auth.sign_in")}

        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.access_your_unified_arogyaos_workspace")}

        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${componentStyles.card.base} p-8`}>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("auth.email_address")}

            </label>
            <input
              type="email"
              disabled={isLoading}
              placeholder={t("auth.eg_namehospitalin")}
              className={`${componentStyles.input.base} ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('email')} />
            
            {errors.email &&
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.email.message}
              </p>
            }
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("auth.password")}

              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">{t("auth.forgot")}


              </Link>
            </div>
            <input
              type="password"
              disabled={isLoading}
              placeholder="••••••••"
              className={`${componentStyles.input.base} ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('password')} />
            
            {errors.password &&
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.password.message}
              </p>
            }
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-2`}>
            
            {isLoggingIn ?
            <Spinner className="h-5 w-5 animate-spin mr-2" /> :
            null}{t("auth.authenticate")}

          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">{t("auth.or_continue_with")}

            </span>
          </div>
        </div>

        {/* Google OAuth button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => loginWithGoogle()}
          className={`${componentStyles.button.base} ${componentStyles.button.outline} w-full py-3.5`}>
          
          {isGoogleLoggingIn ?
          <Spinner className="h-5 w-5 animate-spin mr-2" /> :

          <GoogleIcon />
          }{t("auth.google_workplace")}

        </button>
      </motion.div>

      <div className="text-center text-sm text-slate-500">{t("auth.new_to_arogyaos")}
        {' '}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:underline dark:text-blue-400">{t("auth.create_healthcare_account")}


        </Link>
      </div>
    </div>);

}
export default LoginForm;