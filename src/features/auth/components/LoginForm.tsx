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
import { Input } from '@/components/ui/input';
import { DemoLoginModal } from './DemoLoginModal';
import { useSearchParams } from 'next/navigation';
import { DEMO_ACCOUNTS } from '@/config/demoAccounts';
import { UserRole } from '@/config/roles';
import { ShieldCheck } from 'lucide-react';


export function LoginForm() {
  const { t } = useLanguage();
  const { login, isLoggingIn } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const searchParams = useSearchParams();

  React.useEffect(() => {
    const demoRole = searchParams.get('demoRole') as UserRole | null;
    
    if (demoRole && DEMO_ACCOUNTS[demoRole]) {
      setValue('email', DEMO_ACCOUNTS[demoRole].email);
      setValue('password', DEMO_ACCOUNTS[demoRole].password);
      setIsDemoMode(true);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
    } catch {
      // Toast notifications are already dispatched in hooks onSuccess/onError
    }
  };

  const Spinner = icons.Loader2;
  const isLoading = isLoggingIn;

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
      <DemoLoginModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
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

        {isDemoMode && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Google Solution Challenge Demo
            </div>
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
              Prefilled demo credentials.<br />Click <strong className="font-bold">Sign In</strong> to explore.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.email_address")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Mail className="h-4.5 w-4.5 text-slate-450 dark:text-slate-500" />
              </div>
              <Input
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
              <Input
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
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-4 active:scale-[0.99] font-semibold tracking-wide shadow-md shadow-blue-500/10 hover:shadow-blue-500/20`}
          >
            {isLoggingIn ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}
            {t("auth.authenticate")}
          </motion.button>
          
          {/* Demo Button */}
          <motion.button
            variants={fieldVariants}
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className={`${componentStyles.button.base} ${componentStyles.button.outline} w-full py-3.5 mt-3`}
          >
            🚀 Try Demo
          </motion.button>
        </form>

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