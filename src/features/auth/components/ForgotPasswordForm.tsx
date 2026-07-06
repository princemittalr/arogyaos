'use client';import { useLanguage } from "@/providers/LanguageProvider";

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
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: emailSchema
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {const { t } = useLanguage();
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

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t("auth.reset_password")}

        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.recover_your_arogyaos_credentials")}

        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${componentStyles.card.base} p-8`}>
        
        {sent ?
        <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <icons.CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t("auth.recovery_link_sent")}

          </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.we_have_dispatched_a_secure_credential_recovery_link_to_your_inbox")}

          </p>
            <Link
            href="/login"
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3`}>{t("auth.back_to_sign_in")}


          </Link>
          </div> :

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("auth.email_address")}

            </label>
              <input
              type="email"
              disabled={loading}
              placeholder={t("auth.eg_namehospitalin")}
              className={`${componentStyles.input.base} ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('email')} />
            
              {errors.email &&
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                  {errors.email.message}
                </p>
            }
            </div>

            <button
            type="submit"
            disabled={loading}
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-2`}>
            
              {loading ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}{t("auth.send_recovery_link")}

          </button>
          </form>
        }
      </motion.div>

      <div className="text-center text-sm text-slate-500">{t("auth.remember_your_password")}
        {' '}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:underline dark:text-blue-400">{t("auth.sign_in")}


        </Link>
      </div>
    </div>);

}
export default ForgotPasswordForm;