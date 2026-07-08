'use client';

import { useLanguage } from "@/providers/LanguageProvider";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { passwordSchema } from '@/utils/validators';
import { authHelpers } from '@/firebase';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, AlertCircle, AlertTriangle } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const Spinner = icons.Loader2;
  const oobCode = searchParams.get('oobCode');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setCodeValid(false);
      return;
    }

    // Verify recovery code validity
    authHelpers.verifyResetCode(oobCode)
      .then(() => {
        setCodeValid(true);
      })
      .catch((error) => {
        console.error('Error verifying action code:', error);
        setCodeValid(false);
        toast.error(t("auth.the_recovery_code_is_invalid_or_expired"));
      });
  }, [oobCode, t]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!oobCode) {
      toast.error(t("auth.no_reset_code_provided"));
      return;
    }

    setLoading(true);
    try {
      await authHelpers.confirmPasswordReset(oobCode, data.password);
      toast.success(t("auth.your_password_has_been_successfully_reset"));
      router.push('/login');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

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

  if (codeValid === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Spinner className="h-9 w-9 animate-spin text-blue-600 dark:text-blue-450" />
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 animate-pulse">Verifying Security Code...</p>
      </div>
    );
  }

  if (codeValid === false) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="glass-panel relative overflow-hidden rounded-2xl p-8 max-w-md mx-auto text-center space-y-5 backdrop-blur-xl"
      >
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-red-500" />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 shadow-inner">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{t("auth.invalid_recovery_code")}</h3>
          <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
            {t("auth.this_password_recovery_link_has_expired_or_is_invalid_please_request_a_new_recovery_link")}
          </p>
        </div>
        <Link
          href="/forgot-password"
          className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-2 active:scale-[0.99] font-semibold tracking-wide shadow-md shadow-blue-500/10 hover:shadow-blue-500/20`}
        >
          {t("auth.request_recovery_link")}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t("auth.choose_new_password")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.secure_your_arogyaos_credentials")}</p>
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
          {/* New Password */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.new_password")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-4.5 w-4.5 text-slate-455 dark:text-slate-500" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                disabled={loading}
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

          {/* Confirm New Password */}
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.confirm_new_password")}</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-4.5 w-4.5 text-slate-455 dark:text-slate-500" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                disabled={loading}
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
              <p className="text-xs font-semibold text-red-655 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.confirmPassword.message}</span>
              </p>
            )}
          </motion.div>

          {/* Submit */}
          <motion.button
            variants={fieldVariants}
            type="submit"
            disabled={loading}
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-3 active:scale-[0.99] font-semibold tracking-wide shadow-md shadow-blue-500/10 hover:shadow-blue-500/20`}
          >
            {loading ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}
            {t("auth.update_password")}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default ResetPasswordForm;