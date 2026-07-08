'use client';

import { useLanguage } from "@/providers/LanguageProvider";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { loginFormSchema } from '@/utils/validators';
import { LoginFormValues } from '../types';
import { useAuthActions } from '../hooks/useAuthActions';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const { t } = useLanguage();
  const { login, loginWithGoogle, isLoggingIn, isGoogleLoggingIn } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);

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
    }
  };

  const GoogleIcon = () => (
    <svg className="mr-2.5 h-4.5 w-4.5" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
    </svg>
  );

  const Spinner = icons.Loader2;
  const isLoading = isLoggingIn || isGoogleLoggingIn;

  // Stagger animation config
  const formVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        staggerChildren: 0.08
      } 
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } 
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t("auth.sign_in")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.access_your_unified_arogyaos_workspace")}</p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className="glass-panel relative overflow-hidden rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Top glowing gradient border decoration */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.email_address")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Mail className="h-4.5 w-4.5 text-slate-450 dark:text-slate-500" />
              </div>
              <input
                id="email"
                type="email"
                disabled={isLoading}
                placeholder={t("auth.eg_namehospitalin")}
                className={`${componentStyles.input.base} pl-11 ${errors.email ? 'border-red-500 focus:ring-red-500/20 dark:border-red-900/50' : 'focus:border-blue-500 focus:ring-blue-500/20'}`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-semibold text-red-650 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </motion.div>

          {/* Password field */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.password")}</label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {t("auth.forgot")}
              </Link>
            </div>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-4.5 w-4.5 text-slate-450 dark:text-slate-500" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                placeholder="••••••••"
                className={`${componentStyles.input.base} pl-11 pr-11 ${errors.password ? 'border-red-500 focus:ring-red-500/20 dark:border-red-900/50' : 'focus:border-blue-500 focus:ring-blue-500/20'}`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-semibold text-red-655 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.password.message}</span>
              </p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            variants={fieldVariants}
            type="submit"
            disabled={isLoading}
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-2 active:scale-[0.99] font-semibold tracking-wide shadow-md shadow-blue-500/10 hover:shadow-blue-500/20`}
          >
            {isLoggingIn ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}
            {t("auth.authenticate")}
          </motion.button>
        </form>

        <motion.div variants={fieldVariants} className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800/80" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
            <span className="bg-white/80 px-3 text-slate-400 dark:bg-slate-900/80 rounded-full">{t("auth.or_continue_with")}</span>
          </div>
        </motion.div>

        {/* Google OAuth button */}
        <motion.button
          variants={fieldVariants}
          type="button"
          disabled={isLoading}
          onClick={() => loginWithGoogle()}
          className={`${componentStyles.button.base} ${componentStyles.button.outline} w-full py-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-[0.99] font-semibold text-slate-700 dark:text-slate-350`}
        >
          {isGoogleLoggingIn ? (
            <Spinner className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <GoogleIcon />
          )}
          {t("auth.google_workplace")}
        </motion.button>
      </motion.div>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t("auth.new_to_arogyaos")}{' '}
        <Link
          href="/register"
          className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {t("auth.create_healthcare_account")}
        </Link>
      </div>
    </div>
  );
}

export default LoginForm;