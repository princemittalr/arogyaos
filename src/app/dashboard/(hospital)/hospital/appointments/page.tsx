'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalAppointments,
  useHospitalDoctors,
  useRescheduleAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from '@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { AppointmentDocument } from '@/firebase/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Edit, CheckCircle, XCircle, Search, X } from 'lucide-react';

const rescheduleSchema = zod.object({
  appointmentId: zod.string(),
  appointmentDate: zod.string().min(10, 'Provide a valid date (YYYY-MM-DD)'),
  appointmentTime: zod.string().min(5, 'Provide a valid time (HH:MM)'),
});

type RescheduleFormValues = zod.infer<typeof rescheduleSchema>;

export default function HospitalAppointmentsPage() {
  const hospitalId = 'hosp_city_gen';
  const { data: appointments, isLoading: apptsLoading } = useHospitalAppointments(hospitalId);
  const { data: doctors, isLoading: docsLoading } = useHospitalDoctors(hospitalId);

  const rescheduleMutation = useRescheduleAppointmentMutation();
  const updateStatusMutation = useUpdateAppointmentStatusMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [rescheduleItem, setRescheduleItem] = useState<AppointmentDocument | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
  });

  if (apptsLoading || docsLoading) {
    return <LoadingState variant="table" />;
  }

  const handleOpenReschedule = (appt: AppointmentDocument) => {
    setRescheduleItem(appt);
    setValue('appointmentId', appt.appointmentId);
    setValue('appointmentDate', appt.appointmentDate);
    setValue('appointmentTime', appt.appointmentTime);
  };

  const handleRescheduleSubmit = async (values: RescheduleFormValues) => {
    await rescheduleMutation.mutateAsync({
      hospitalId,
      appointmentId: values.appointmentId,
      date: values.appointmentDate,
      time: values.appointmentTime,
    });
    setRescheduleItem(null);
  };

  const handleStatusChange = async (appointmentId: string, status: AppointmentDocument['status']) => {
    await updateStatusMutation.mutateAsync({ hospitalId, appointmentId, status });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = appointments?.filter((appt) => {
    // filter tab
    const isToday = appt.appointmentDate === todayStr;
    const isUpcoming = appt.appointmentDate > todayStr;
    const isCompleted = appt.status === 'completed';
    const isCancelled = appt.status === 'cancelled';

    if (selectedTab === 'today') {
      if (!isToday || appt.status === 'completed' || appt.status === 'cancelled') return false;
    } else if (selectedTab === 'upcoming') {
      if (!isUpcoming || appt.status === 'completed' || appt.status === 'cancelled') return false;
    } else if (selectedTab === 'completed') {
      if (!isCompleted) return false;
    } else if (selectedTab === 'cancelled') {
      if (!isCancelled) return false;
    }

    // search filter
    const docMatch = doctors?.find((d) => d.uid === appt.doctorId);
    const searchString = `${appt.appointmentId} ${appt.tokenNumber} ${docMatch?.doctorName || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation Roster"
        description="Monitor daily tokens, reschedule appointments, and register patient check-ins."
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {(['today', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold capitalize border-b-2 transition ${
              selectedTab === tab
                ? 'border-blue-650 text-blue-650 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'today' ? "Today's Queue" : tab}
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Doctor Name or Token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-transparent rounded-xl text-xs font-bold text-slate-750 dark:border-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10 col-span-full">No appointments in this category.</p>
        ) : (
          filtered.map((appt) => {
            const docMatch = doctors?.find((d) => d.uid === appt.doctorId);
            return (
              <motion.div
                key={appt.appointmentId}
                layout
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                        Token #{appt.tokenNumber}
                      </span>
                      <p className="text-[9px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">ID: {appt.appointmentId}</p>
                    </div>

                    <span className="text-[10px] font-bold text-slate-550 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {appt.appointmentTime}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Doctor:</span>
                      <span className="text-slate-850 dark:text-slate-350">{docMatch?.doctorName || 'Dr. Specialist'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Consultation branch:</span>
                      <span className="text-slate-850 dark:text-slate-350">{docMatch?.departmentName || 'General Medicine'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Appointment Date:</span>
                      <span className="text-slate-850 dark:text-slate-350">{appt.appointmentDate}</span>
                    </div>
                  </div>
                </div>

                {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex gap-2 justify-end">
                    <button
                      onClick={() => handleOpenReschedule(appt)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Reschedule
                    </button>
                    <button
                      onClick={() => handleStatusChange(appt.appointmentId, 'completed')}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[10px] font-bold text-white flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" /> Complete
                    </button>
                    <button
                      onClick={() => handleStatusChange(appt.appointmentId, 'cancelled')}
                      className="rounded-xl border border-red-200 text-red-650 hover:bg-red-50 px-3 py-1.5 text-[10px] font-bold flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" /> Cancel
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Reschedule Overlay Dialog */}
      <AnimatePresence>
        {rescheduleItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRescheduleItem(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-250 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">Reschedule Consultation</h3>
                <button onClick={() => setRescheduleItem(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleRescheduleSubmit)} className="space-y-4 text-xs">
                <input type="hidden" {...register('appointmentId')} />

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">New Date</label>
                  <input
                    type="date"
                    {...register('appointmentDate')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                  {errors.appointmentDate && <p className="text-red-500 mt-1 font-bold">{errors.appointmentDate.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">New Time</label>
                  <input
                    type="time"
                    {...register('appointmentTime')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                  {errors.appointmentTime && <p className="text-red-500 mt-1 font-bold">{errors.appointmentTime.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setRescheduleItem(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-750"
                  >
                    Apply Reschedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
