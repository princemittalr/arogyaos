'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { icons } from '@/design-system/icons';
import { useToast, ToasterToast, ToastVariant } from './use-toast';
import { cn } from '@/utils/cn';

const TOAST_LIFETIME = 5000;

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-label="Notifications"
      role="region"
      className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:flex-col md:max-w-[420px]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast, index) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            index={index} 
            total={toasts.length}
            onDismiss={() => dismiss(toast.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ 
  toast, 
  index, 
  total,
  onDismiss 
}: { 
  toast: ToasterToast; 
  index: number;
  total: number;
  onDismiss: () => void; 
}) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, TOAST_LIFETIME);
    return () => clearTimeout(timer);
  }, [isHovered, onDismiss]);

  const Icon = getIcon(toast.variant);
  const colors = getColors(toast.variant);

  // Stack calculation
  // Toasts are rendered top to bottom in the DOM but appear bottom-up visually.
  // The first item (index 0) is the newest.
  const isFront = index === 0;
  const offset = index * 14;
  const scale = 1 - index * 0.05;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity: index > 2 ? 0 : 1, 
        y: -offset, 
        scale: index > 2 ? 0.9 : scale,
        zIndex: total - index
      }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        position: index === 0 ? 'relative' : 'absolute',
        bottom: index === 0 ? 0 : 0,
        width: '100%',
        transformOrigin: 'bottom center',
      }}
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all",
        colors.bg,
        colors.border
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colors.iconBg)}>
        <Icon className={cn("h-4 w-4", colors.iconText)} />
      </div>
      
      <div className="flex flex-1 flex-col gap-1">
        {toast.title && (
          <h3 className={cn("text-sm font-semibold", colors.title)}>
            {toast.title}
          </h3>
        )}
        {toast.description && (
          <p className={cn("text-xs leading-relaxed", colors.desc)}>
            {toast.description}
          </p>
        )}
      </div>

      {toast.action && (
        <div className="shrink-0">
          {toast.action}
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100",
          colors.close
        )}
        aria-label="Close notification"
      >
        <icons.X className="h-4 w-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/5 dark:bg-white/5">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: isHovered ? "100%" : "0%" }}
          transition={{ duration: TOAST_LIFETIME / 1000, ease: "linear" }}
          className={cn("h-full", colors.progress)}
        />
      </div>
    </motion.div>
  );
}

function getIcon(variant?: ToastVariant) {
  switch (variant) {
    case 'success': return icons.CheckCircle2;
    case 'error': return icons.AlertCircle;
    case 'warning': return icons.AlertTriangle;
    case 'info': return icons.Info;
    default: return icons.Bell;
  }
}

function getColors(variant?: ToastVariant) {
  switch (variant) {
    case 'success':
      return {
        bg: "bg-emerald-50/90 dark:bg-emerald-950/90",
        border: "border-emerald-200/50 dark:border-emerald-900/50",
        iconBg: "bg-emerald-100 dark:bg-emerald-900",
        iconText: "text-emerald-600 dark:text-emerald-400",
        title: "text-emerald-900 dark:text-emerald-50",
        desc: "text-emerald-700 dark:text-emerald-200/80",
        close: "text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50",
        progress: "bg-emerald-500/50"
      };
    case 'error':
      return {
        bg: "bg-red-50/90 dark:bg-red-950/90",
        border: "border-red-200/50 dark:border-red-900/50",
        iconBg: "bg-red-100 dark:bg-red-900",
        iconText: "text-red-600 dark:text-red-400",
        title: "text-red-900 dark:text-red-50",
        desc: "text-red-700 dark:text-red-200/80",
        close: "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50",
        progress: "bg-red-500/50"
      };
    case 'warning':
      return {
        bg: "bg-amber-50/90 dark:bg-amber-950/90",
        border: "border-amber-200/50 dark:border-amber-900/50",
        iconBg: "bg-amber-100 dark:bg-amber-900",
        iconText: "text-amber-600 dark:text-amber-400",
        title: "text-amber-900 dark:text-amber-50",
        desc: "text-amber-700 dark:text-amber-200/80",
        close: "text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50",
        progress: "bg-amber-500/50"
      };
    case 'info':
      return {
        bg: "bg-blue-50/90 dark:bg-blue-950/90",
        border: "border-blue-200/50 dark:border-blue-900/50",
        iconBg: "bg-blue-100 dark:bg-blue-900",
        iconText: "text-blue-600 dark:text-blue-400",
        title: "text-blue-900 dark:text-blue-50",
        desc: "text-blue-700 dark:text-blue-200/80",
        close: "text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50",
        progress: "bg-blue-500/50"
      };
    default:
      return {
        bg: "bg-white/90 dark:bg-slate-900/90",
        border: "border-slate-200/50 dark:border-slate-800/50",
        iconBg: "bg-slate-100 dark:bg-slate-800",
        iconText: "text-slate-600 dark:text-slate-400",
        title: "text-slate-900 dark:text-slate-50",
        desc: "text-slate-500 dark:text-slate-400",
        close: "text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800",
        progress: "bg-slate-900/20 dark:bg-slate-100/20"
      };
  }
}
