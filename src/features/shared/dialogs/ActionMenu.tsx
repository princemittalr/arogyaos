'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  isDestructive?: boolean;
}

interface ActionMenuProps {
  actions: ActionItem[];
  trigger?: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function ActionMenu({ actions, trigger, align = 'right', className }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      {/* Trigger Button */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger || (
          <button className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Menu Options Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-30 mt-2 w-48 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900',
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
            )}
          >
            <div className="flex flex-col gap-0.5">
              {actions.map((act, idx) => {
                const Icon = act.icon;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      act.onClick();
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs font-semibold transition text-left select-none',
                      act.isDestructive
                        ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 dark:hover:text-slate-100'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default ActionMenu;
