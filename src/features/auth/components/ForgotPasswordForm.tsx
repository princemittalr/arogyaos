'use client';

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
  email: emailSchema,
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const Spinner = icons.Loader2;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    try {
      await authHelpers.sendPasswordReset(data.email);
      setSent(true);
      toast.success('Password reset email sent. Please check your inbox.');
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Reset Password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Recover your ArogyaOS credentials
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${componentStyles.card.base} p-8`}
      >
        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <icons.CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Recovery Link Sent
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We have dispatched a secure credential recovery link to your inbox.
            </p>
            <Link
              href="/login"
              className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3`}
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                disabled={loading}
                placeholder="e.g. name@hospital.in"
                className={`${componentStyles.input.base} ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3.5 mt-2`}
            >
              {loading ? <Spinner className="h-5 w-5 animate-spin mr-2" /> : null}
              Send Recovery Link
            </button>
          </form>
        )}
      </motion.div>

      <div className="text-center text-sm text-slate-500">
        Remember your password?{' '}
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
export default ForgotPasswordForm;
