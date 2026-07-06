'use client';import { useLanguage } from "@/providers/LanguageProvider";

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

const resetPasswordSchema = z.
object({
  password: passwordSchema,
  confirmPassword: z.string()
}).
refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const Spinner = icons.Loader2;
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setCodeValid(false);
      return;
    }

    // Verify recovery code validity
    authHelpers.
    verifyResetCode(oobCode).
    then(() => {
      setCodeValid(true);
    }).
    catch((error) => {
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

  if (codeValid === null) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>);

  }

  if (codeValid === false) {
    return (
      <div className={`${componentStyles.card.base} p-8 max-w-md mx-auto text-center space-y-4`}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          <icons.AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t("auth.invalid_recovery_code")}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.this_password_recovery_link_has_expired_or_is_invalid_please_request_a_new_recovery_link")}

        </p>
        <Link
          href="/forgot-password"
          className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3`}>{t("auth.request_recovery_link")}


        </Link>
      </div>);

  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t("auth.choose_new_password")}

        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.secure_your_arogyaos_credentials")}

        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${componentStyles.card.base} p-8`}>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("auth.new_password")}

            </label>
            <input
              type="password"
              disabled={loading}
              placeholder="••••••••"
              className={`${componentStyles.input.base} ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('password')} />
            
            {errors.password &&
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.password.message}
              </p>
            }
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("auth.confirm_new_password")}

            </label>
            <input
              type="password"
              disabled={loading}
              placeholder="••••••••"
              className={`${componentStyles.input.base} ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              {...register('confirmPassword')} />
            
            {errors.confirmPassword &&
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            }
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-2`}>
            
            {loading ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}{t("auth.update_password")}

          </button>
        </form>
      </motion.div>
    </div>);

}
export default ResetPasswordForm;