'use client';

import { useLanguage } from "@/providers/LanguageProvider";
import React, { useState } from 'react';
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
import { Mail, Lock, Eye, EyeOff, User, UserCheck, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';


export function RegisterForm() {
  const { t } = useLanguage();
  const { register: registerUser, isRegistering } = useAuthActions();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'citizen'
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser({
        email: data.email,
        fullName: data.fullName,
        role: data.role as UserRole,
        password: data.password
      });
    } catch {
      // Handled in actions hook
    }
  };

  const Spinner = icons.Loader2;
  const isLoading = isRegistering;

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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t("auth.create_account")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.register_to_join_the_arogyaos_healthcare_network")}</p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className="glass-panel relative overflow-hidden rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Top glowing gradient border decoration */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.full_name")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <User className="h-4.5 w-4.5 text-slate-455 dark:text-slate-500" />
              </div>
              <Input
                id="fullName"
                type="text"
                disabled={isLoading}
                placeholder={t("auth.eg_rahul_sharma")}
                className={`${componentStyles.input.base} pl-11 ${errors.fullName ? 'border-red-500 focus:ring-red-500/20 dark:border-red-900/50' : 'focus:border-blue-500 focus:ring-blue-500/20'}`}
                {...register('fullName')}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs font-semibold text-red-650 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.fullName.message}</span>
              </p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.email_address")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Mail className="h-4.5 w-4.5 text-slate-455 dark:text-slate-500" />
              </div>
              <Input
                id="email"
                type="email"
                disabled={isLoading}
                placeholder={t("auth.eg_rahularogyain")}
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

          {/* Role selection */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.healthcare_role")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <UserCheck className="h-4.5 w-4.5 text-slate-455 dark:text-slate-500" />
              </div>
              <select
                id="role"
                disabled={isLoading}
                className={`${componentStyles.input.base} pl-11 pr-10 appearance-none ${errors.role ? 'border-red-500 focus:ring-red-500/20 dark:border-red-900/50' : 'focus:border-blue-500 focus:ring-blue-500/20'}`}
                {...register('role')}
              >
                <option value="citizen">{t("auth.citizen_patient")}</option>
                <option value="doctor">{t("auth.doctor_consultant")}</option>
                <option value="hospital_admin">{t("auth.hospital_administrator")}</option>
                <option value="district_admin">{t("auth.district_health_officer")}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                <icons.ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
            {errors.role && (
              <p className="text-xs font-semibold text-red-650 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.role.message}</span>
              </p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.password")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-4.5 w-4.5 text-slate-455 dark:text-slate-500" />
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
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-455 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-semibold text-red-650 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.password.message}</span>
              </p>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.confirm_password")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-4.5 w-4.5 text-slate-455 dark:text-slate-500" />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                disabled={isLoading}
                placeholder="••••••••"
                className={`${componentStyles.input.base} pl-11 pr-11 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20 dark:border-red-900/50' : 'focus:border-blue-500 focus:ring-blue-500/20'}`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-455 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-semibold text-red-650 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.confirmPassword.message}</span>
              </p>
            )}
          </motion.div>

          {/* Submit */}
          <motion.button
            variants={fieldVariants}
            type="submit"
            disabled={isLoading}
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-4 active:scale-[0.99] font-semibold tracking-wide shadow-md shadow-blue-500/10 hover:shadow-blue-500/20`}
          >
            {isRegistering ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}
            {t("auth.register_profile")}
          </motion.button>
        </form>

      </motion.div>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t("auth.already_have_a_profile")}{' '}
        <Link
          href="/login"
          className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {t("auth.sign_in")}
        </Link>
      </div>
    </div>
  );
}

export default RegisterForm;