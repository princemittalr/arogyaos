'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLE_DEFINITIONS, RoleDef } from './RoleSelector';
import { useRouter } from 'next/navigation';
import { X, PlayCircle, ShieldCheck } from 'lucide-react';
import { icons } from '@/design-system/icons';

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoLoginModal({ isOpen, onClose }: DemoLoginModalProps) {
  const router = useRouter();

  const handleDemoSelect = (role: RoleDef) => {
    onClose();
    router.push(`/login?demoRole=${role.id}`);
  };

  const Spinner = icons.Loader2;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col border border-slate-200 dark:border-slate-800">
              
              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 relative shrink-0">
                <button 
                  onClick={onClose}
                  className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4 border border-blue-100 dark:border-blue-800/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Google Solution Challenge Demo
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-2">
                  Explore ArogyaOS
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
                  Experience every healthcare role through preconfigured demo accounts.
                </p>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950/50 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ROLE_DEFINITIONS.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleDemoSelect(role)}
                      className="group relative flex flex-col text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 overflow-hidden"
                    >
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <role.icon className="w-5 h-5" />
                        </div>
                        <PlayCircle className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {role.description}
                      </p>

                      {/* Glowing effect on hover */}
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
