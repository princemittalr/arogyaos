'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDoctorProfile, useDoctorQueue } from '@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';

export default function DoctorCalendarPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const doctorId = user?.uid || 'doc_arav_mehta';

  const { data: profile, isLoading: profileLoading } = useDoctorProfile(doctorId);
  const { data: queue, isLoading: queueLoading } = useDoctorQueue(doctorId);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  if (profileLoading || queueLoading) {
    return <LoadingState variant="table" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("doctor.duty_scheduler_calendar")}
        description={t("doctor.configure_your_active_availability_days_slot_limits_or_audit_upcoming_consultation_timings")} />
      

      {/* Controller bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 transition">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100">{t("doctor.july_5_july_11_2026")}</span>
          <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 transition">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((mode) =>
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
            viewMode === mode ?
            'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm' :
            'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-350'}`
            }>
            
              {mode}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Slots Grid */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-6 uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />{t("doctor.duty_calendar_view")}{viewMode})
          </h3>

          <div className="grid grid-cols-5 gap-3">
            {['Mon 06', 'Tue 07', 'Wed 08', 'Thu 09', 'Fri 10'].map((day, idx) => {
              const dayIndex = idx + 1;
              const hasDuty = profile?.availability.some((a) => a.dayOfWeek === dayIndex);
              const dayAppts = queue?.filter((a) => {
                const dateNum = new Date(a.appointmentDate).getDay();
                return dateNum === dayIndex;
              }) || [];

              return (
                <div
                  key={day}
                  className={`rounded-xl border p-3 min-h-[220px] transition ${
                  hasDuty ?
                  'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50' :
                  'border-slate-100 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-950/20 opacity-60'}`
                  }>
                  
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-300 block mb-3 uppercase tracking-wider">
                    {day}
                  </span>

                  {hasDuty ?
                  <div className="space-y-2">
                      <span className="inline-flex rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 px-2 py-0.5 text-[8px] font-bold">{t("doctor.on_duty")}

                    </span>

                      {dayAppts.length === 0 ?
                    <p className="text-[9px] text-slate-400 italic font-semibold pt-4">{t("doctor.no_patients_booked")}</p> :

                    dayAppts.map((appt) =>
                    <div
                      key={appt.appointmentId}
                      className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-150 dark:border-slate-850 text-left space-y-1">
                      
                            <span className="text-[9px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {appt.patientName}
                            </span>
                            <span className="text-[8px] font-semibold text-slate-400 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {appt.appointmentTime}
                            </span>
                          </div>
                    )
                    }
                    </div> :

                  <span className="text-[8px] font-bold text-slate-400">{t("doctor.off_duty")}</span>
                  }
                </div>);

            })}
          </div>
        </div>

        {/* Duty Hours & Availability Config */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-500" />{t("doctor.availability_profile")}
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl space-y-1.5 font-bold text-xs text-slate-650 dark:text-slate-450 border border-slate-150 dark:border-slate-850">
              <p>{t("doctor.specialization")}<span className="text-slate-850 dark:text-slate-100">{profile?.specialization}</span></p>
              <p>{t("doctor.consultation_fee")}<span className="text-slate-850 dark:text-slate-100">₹{profile?.consultationFee}</span></p>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">{t("doctor.active_slots_configuration")}</h4>
              {[
              { day: 'Monday', hours: '09:00 AM - 05:00 PM' },
              { day: 'Tuesday', hours: '09:00 AM - 05:00 PM' },
              { day: 'Wednesday', hours: '09:00 AM - 05:00 PM' },
              { day: 'Thursday', hours: '09:00 AM - 05:00 PM' },
              { day: 'Friday', hours: '09:00 AM - 05:00 PM' }].
              map((item) =>
              <div key={item.day} className="flex justify-between items-center text-xs font-semibold py-1">
                  <span className="text-slate-800 dark:text-slate-200">{item.day}</span>
                  <span className="text-slate-500 font-bold">{item.hours}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}