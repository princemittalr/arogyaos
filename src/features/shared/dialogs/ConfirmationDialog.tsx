'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
}: ConfirmationDialogProps) {
  const AlertIcon = icons.AlertTriangle;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Dialog Card Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              componentStyles.card.base,
              'relative z-10 w-full max-w-md p-6 space-y-5 shadow-2xl'
            )}
          >
            <div className="flex gap-4">
              <div
                className={cn(
                  'rounded-xl p-2.5 h-fit flex-shrink-0',
                  isDestructive
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                )}
              >
                <AlertIcon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-50">{title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className={cn(componentStyles.button.base, componentStyles.button.outline, 'px-4 py-2.5')}
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  componentStyles.button.base,
                  isDestructive ? 'bg-red-600 hover:bg-red-500 text-white' : componentStyles.button.primary,
                  'px-4 py-2.5'
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default ConfirmationDialog;
