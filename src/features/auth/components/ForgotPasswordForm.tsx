'use client';

import { useLanguage } from "@/providers/LanguageProvider";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { z } from 'zod';
import { emailSchema } from '@/utils/validators';
import { authHelpers } from '@/firebase';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';
import { toast } from '@/components/ui/toast';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';


const forgotPasswordSchema = z.object({
  email: emailSchema
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const Spinner = icons.Loader2;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    try {
      await authHelpers.sendPasswordReset(data.email);
      setSent(true);
      toast.success(t("auth.password_reset_email_sent_please_check_your_inbox"));
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to trigger password recovery.');
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

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t("auth.reset_password")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.recover_your_arogyaos_credentials")}</p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className="glass-panel relative overflow-hidden rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Top glowing gradient border decoration */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-inner">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{t("auth.recovery_link_sent")}</h3>
              <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
                {t("auth.we_have_dispatched_a_secure_credential_recovery_link_to_your_inbox")}
              </p>
            </div>
            <Link
              href="/login"
              className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-2 active:scale-[0.99] font-semibold tracking-wide shadow-md shadow-blue-500/10 hover:shadow-blue-500/20`}
            >
              {t("auth.back_to_sign_in")}
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Address */}
            <motion.div variants={fieldVariants} className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("auth.email_address")}</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4.5 w-4.5 text-slate-455 dark:text-slate-500" />
                </div>
                <Input
                  id="email"
                  type="email"
                  disabled={loading}
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

            {/* Submit */}
            <motion.button
              variants={fieldVariants}
              type="submit"
              disabled={loading}
              className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 active:scale-[0.99] font-semibold tracking-wide shadow-md shadow-blue-500/10 hover:shadow-blue-500/20`}
            >
              {loading ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}
              {t("auth.request_recovery_link")}
            </motion.button>

            {/* Back to sign in */}
            <motion.div variants={fieldVariants} className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("auth.back_to_sign_in")}</span>
              </Link>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
}