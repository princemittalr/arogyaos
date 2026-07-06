'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  useAppointments,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation } from
'@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState, StatusBadge, EmptyState, ConfirmationDialog } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';
import { icons } from '@/design-system/icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function CitizenAppointmentsPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Tab state: 'upcoming' | 'completed' | 'cancelled'
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Modal actions state
  const [cancellingApptId, setCancellingApptId] = useState<string | null>(null);
  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Queries & Mutations
  const { data: appointments, isLoading } = useAppointments(uid);
  const cancelMutation = useCancelAppointmentMutation();
  const rescheduleMutation = useRescheduleAppointmentMutation();

  if (isLoading) {
    return <LoadingState variant="table" rows={4} />;
  }

  // Filter list by status mapping
  const filteredAppointments = appointments?.filter((appt) => {
    if (activeTab === 'upcoming') return appt.status === 'scheduled' || appt.status === 'checked_in';
    if (activeTab === 'completed') return appt.status === 'completed';
    return appt.status === 'cancelled';
  });

  const handleCancelConfirm = async () => {
    if (!cancellingApptId) return;
    await cancelMutation.mutateAsync({
      appointmentId: cancellingApptId,
      patientId: uid
    });
    setCancellingApptId(null);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApptId || !rescheduleDate || !rescheduleTime) return;

    await rescheduleMutation.mutateAsync({
      appointmentId: reschedulingApptId,
      patientId: uid,
      date: rescheduleDate,
      time: rescheduleTime
    });

    setReschedulingApptId(null);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8">
      
      <PageHeader
        title={t("citizen.consultation_planner")}
        description={t("citizen.check_schedule_tokens_update_date_availability_or_request_cancellations")} />
      

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold select-none">
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) =>
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            'pb-3.5 capitalize relative transition',
            activeTab === tab ?
            'text-blue-650 dark:text-blue-400 font-bold' :
            'text-slate-500 hover:text-slate-800'
          )}>
          
            {tab}
            {activeTab === tab &&
          <motion.div
            layoutId="activeTabUnderline"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />

          }
          </button>
        )}
      </div>

      {/* Appointments List Grid */}
      {filteredAppointments && filteredAppointments.length > 0 ?
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((appt) =>
        <motion.div
          key={appt.appointmentId}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-5">
          
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-2 text-blue-600 dark:text-blue-400">
                      <icons.Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                        {appt.doctorName}
                      </h4>
                      <p className="text-[10px] text-slate-450">{appt.hospitalName}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge status={appt.status} />
                    <span className="text-[10px] font-bold text-slate-400 block">{t("citizen.token")}{appt.tokenNumber}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-xs border border-slate-100 dark:border-slate-900 space-y-1.5 font-semibold text-slate-650 dark:text-slate-400">
                  <p>{t("citizen.date")}{appt.appointmentDate}</p>
                  <p>{t("citizen.time_slot")}{appt.appointmentTime}</p>
                </div>
              </div>

              {activeTab === 'upcoming' &&
          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                  <button
              onClick={() => {
                setReschedulingApptId(appt.appointmentId);
                setRescheduleDate(appt.appointmentDate);
                setRescheduleTime(appt.appointmentTime);
              }}
              className={cn(componentStyles.button.base, componentStyles.button.outline, 'px-3 py-1.5 text-xs')}>{t("citizen.reschedule")}


            </button>
                  <button
              onClick={() => setCancellingApptId(appt.appointmentId)}
              className="rounded-lg border border-red-200 text-red-650 bg-white hover:bg-red-50 dark:border-red-950/20 dark:bg-slate-900 dark:hover:bg-red-950/20 px-3 py-1.5 text-xs font-semibold transition">{t("citizen.cancel")}


            </button>
                </div>
          }
            </motion.div>
        )}
        </div> :

      <EmptyState
        title={`No ${activeTab} appointments`}
        description={
        activeTab === 'upcoming' ?
        'You do not have any outpatient scheduling booked for the upcoming days.' :
        'Historical reports will appear here once medical visits complete.'
        }
        icon={icons.Calendar || icons.Home} />

      }

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!cancellingApptId}
        onClose={() => setCancellingApptId(null)}
        onConfirm={handleCancelConfirm}
        title={t("citizen.cancel_appointment")}
        description={t("citizen.are_you_sure_you_want_to_cancel_this_scheduled_consultation_the_allocated_token_number_will_be_released")}
        isDestructive
        confirmLabel="Cancel Visit" />
      

      {/* Reschedule Modal Drawer */}
      <AnimatePresence>
        {reschedulingApptId &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReschedulingApptId(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xl">
            
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">{t("citizen.reschedule_consultation")}</h4>
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">{t("citizen.pick_new_date")}</label>
                  <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className={componentStyles.input.base}
                  required />
                
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">{t("citizen.pick_time_slot")}</label>
                  <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className={componentStyles.input.base}
                  required>
                  
                    <option value="09:00 AM">{t("citizen.0900_am")}</option>
                    <option value="10:00 AM">{t("citizen.1000_am")}</option>
                    <option value="11:00 AM">{t("citizen.1100_am")}</option>
                    <option value="12:00 PM">{t("citizen.1200_pm")}</option>
                    <option value="02:00 PM">{t("citizen.0200_pm")}</option>
                    <option value="03:00 PM">{t("citizen.0300_pm")}</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <button
                  type="button"
                  onClick={() => setReschedulingApptId(null)}
                  className={cn(componentStyles.button.base, componentStyles.button.outline, 'px-4 py-2 text-xs')}>{t("citizen.cancel")}


                </button>
                  <button
                  type="submit"
                  disabled={rescheduleMutation.isPending}
                  className={cn(componentStyles.button.base, componentStyles.button.primary, 'px-4 py-2 text-xs')}>
                  
                    {rescheduleMutation.isPending ? 'Updating...' : 'Reschedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </motion.div>);

}