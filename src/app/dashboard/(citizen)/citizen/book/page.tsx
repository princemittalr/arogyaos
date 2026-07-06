'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  useHospitals,
  useDoctors,
  useBookAppointmentMutation } from
'@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { AppointmentDocument } from '@/firebase/types';
import { Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CitizenBookPage() {const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Get options from query parameters
  const initHospitalId = searchParams.get('hospitalId') || '';
  const initDoctorId = searchParams.get('doctorId') || '';

  // Step state: 1 to 6. 7 is Success.
  const [step, setStep] = useState(1);

  // Selections
  const [selectedHospitalId, setSelectedHospitalId] = useState(initHospitalId);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(initDoctorId);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Calendar View State
  const [viewDate, setViewDate] = useState(() => new Date());

  // Success details returned from booking
  const [bookedDetails, setBookedDetails] = useState<AppointmentDocument | null>(null);

  // Queries & Mutations
  const { data: hospitals, isLoading: hospLoading } = useHospitals();
  const { data: doctors, isLoading: docsLoading } = useDoctors();
  const bookMutation = useBookAppointmentMutation();

  const isLoading = hospLoading || docsLoading;

  // Auto-advance logic based on search params
  useEffect(() => {
    if (initHospitalId) {
      setSelectedHospitalId(initHospitalId);
      setStep(2);
    }
    if (initDoctorId) {
      setSelectedDoctorId(initDoctorId);
      // Find the doctor to auto-populate department and hospital
      const docMatch = doctors?.find((d) => d.uid === initDoctorId);
      if (docMatch) {
        setSelectedHospitalId(docMatch.hospitalId);
        setSelectedDept(docMatch.departmentId);
        setStep(4);
      }
    }
  }, [initHospitalId, initDoctorId, doctors]);

  if (isLoading) {
    return <LoadingState variant="table" rows={6} />;
  }

  const selectedHospital = hospitals?.find((h) => h.hospitalId === selectedHospitalId);
  const selectedDoctor = doctors?.find((d) => d.uid === selectedDoctorId);

  // Available departments based on selected hospital
  const departments = selectedHospitalId ?
  Array.from(
    new Set(
      doctors?.filter((d) => d.hospitalId === selectedHospitalId).map((d) => d.departmentId)
    )
  ) :
  [];

  // Available doctors based on hospital and department
  const filteredDoctors = doctors?.filter(
    (d) => d.hospitalId === selectedHospitalId && d.departmentId === selectedDept
  );

  // Dynamic slot availability calculation
  const getAvailableTimeSlots = (dateStr: string) => {
    if (!dateStr) return [];
    const dateObj = new Date(dateStr);
    const day = dateObj.getDay();

    // Sunday: No OPD
    if (day === 0) return [];

    const baseSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM'];


    // Saturday: Half day
    if (day === 6) {
      return ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
    }

    // Filter past hours if selecting today's date
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) {
      const currentHour = new Date().getHours();
      return baseSlots.filter((slot) => {
        const [time, period] = slot.split(' ');
        const [hourStr] = time.split(':');
        let hour = parseInt(hourStr);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return hour > currentHour;
      });
    }

    // Simulated scheduling occupancy variations based on day number
    const dateNum = dateObj.getDate();
    if (dateNum % 3 === 0) {
      return ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
    } else if (dateNum % 2 === 0) {
      return ['10:00 AM', '12:00 PM', '03:00 PM'];
    }

    return baseSlots;
  };

  const timeSlots = getAvailableTimeSlots(selectedDate);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const selectHospital = (id: string) => {
    setSelectedHospitalId(id);
    if (id !== selectedHospitalId) {
      setSelectedDept('');
      setSelectedDoctorId('');
      setSelectedDate('');
      setSelectedTime('');
    }
  };

  const selectDept = (dept: string) => {
    setSelectedDept(dept);
    if (dept !== selectedDept) {
      setSelectedDoctorId('');
      setSelectedDate('');
      setSelectedTime('');
    }
  };

  const selectDoctor = (id: string) => {
    setSelectedDoctorId(id);
    if (id !== selectedDoctorId) {
      setSelectedDate('');
      setSelectedTime('');
    }
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
    if (date !== selectedDate) {
      setSelectedTime('');
    }
  };

  const selectTime = (time: string) => {
    setSelectedTime(time);
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !selectedHospitalId;
      case 2:
        return !selectedDept;
      case 3:
        return !selectedDoctorId;
      case 4:
        return !selectedDate;
      case 5:
        return !selectedTime;
      default:
        return false;
    }
  };

  const handleConfirm = async () => {
    if (!uid || !selectedDoctorId || !selectedHospitalId || !selectedDate || !selectedTime) {
      return;
    }

    try {
      const res = await bookMutation.mutateAsync({
        patientId: uid,
        doctorId: selectedDoctorId,
        hospitalId: selectedHospitalId,
        date: selectedDate,
        time: selectedTime
      });
      setBookedDetails(res);
      setStep(7); // Success step
    } catch {

      // toast is automatically triggered by hook mutation
    }};

  // Steps headers mapping
  const stepsTitles = [
  'Select Hospital',
  'Select Department',
  'Select Doctor',
  'Select Date',
  'Select Time Slot',
  'Review & Confirm'];


  // Helper date formats
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return 'No date selected';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calendar Day Generation
  const calendarDays: (Date | null)[] = [];
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'];


  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isPrevMonthDisabled = () => {
    const now = new Date();
    return (
      year < now.getFullYear() || year === now.getFullYear() && month <= now.getMonth());

  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8">
      
      <PageHeader
        title={t("citizen.outpatient_appointment_booking")}
        description={t("citizen.schedule_consult_visits_and_diagnostic_sessions_with_state_authorized_specialists")} />
      

      {/* Progress Steps Indicators */}
      {step <= 6 &&
      <div className="flex items-center justify-between gap-2 px-2 select-none">
          {stepsTitles.map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = step > stepNum;
          const isActive = step === stepNum;

          return (
            <React.Fragment key={idx}>
                <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  isCompleted ?
                  'bg-emerald-600 text-white' :
                  isActive ?
                  'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' :
                  'bg-slate-100 text-slate-450 dark:bg-slate-900'
                )}>
                
                  {isCompleted ? <Check className="h-4.5 w-4.5" /> : stepNum}
                </div>
                {idx < 5 &&
              <div
                className={cn(
                  'flex-1 h-0.5 transition-all duration-300',
                  step > stepNum ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                )} />

              }
              </React.Fragment>);

        })}
        </div>
      }

      {/* Booking Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 &&
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4">
            
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">{t("citizen.step_1_select_facility")}

            </h4>
              <div className="space-y-3">
                {hospitals?.map((h) =>
              <button
                type="button"
                key={h.hospitalId}
                onClick={() => selectHospital(h.hospitalId)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition text-left focus:outline-none focus:ring-2 focus:ring-blue-500',
                  selectedHospitalId === h.hospitalId ?
                  'border-blue-600 bg-blue-50/10' :
                  'border-slate-100 dark:border-slate-850 hover:border-slate-355'
                )}>
                
                    <span className="font-bold text-sm text-slate-855 dark:text-slate-100 block">
                      {h.hospitalName}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">{h.address}</span>
                  </button>
              )}
              </div>
            </motion.div>
          }

          {step === 2 &&
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4">
            
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">{t("citizen.step_2_choose_department")}

            </h4>
              <div className="grid grid-cols-2 gap-4">
                {departments.map((dept) =>
              <button
                type="button"
                key={dept}
                onClick={() => selectDept(dept)}
                className={cn(
                  'p-4 rounded-xl border-2 transition text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  selectedDept === dept ?
                  'border-blue-600 bg-blue-50/10 text-blue-600' :
                  'border-slate-100 dark:border-slate-850 hover:border-slate-355'
                )}>
                
                    {dept}
                  </button>
              )}
              </div>
            </motion.div>
          }

          {step === 3 &&
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4">
            
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">{t("citizen.step_3_select_specialist")}

            </h4>
              <div className="space-y-3">
                {filteredDoctors?.map((d) =>
              <button
                type="button"
                key={d.uid}
                onClick={() => selectDoctor(d.uid)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500',
                  selectedDoctorId === d.uid ?
                  'border-blue-600 bg-blue-50/10' :
                  'border-slate-100 dark:border-slate-850 hover:border-slate-355'
                )}>
                
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                        {d.doctorName}
                      </span>
                      <span className="text-xs text-slate-450 block">{d.qualification}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450">
                      ₹{d.consultationFee}
                    </span>
                  </button>
              )}
              </div>
            </motion.div>
          }

          {step === 4 &&
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4">
            
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">{t("citizen.step_4_select_appointment_date")}

            </h4>

              {/* Custom Accessible Calendar component */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/30 dark:bg-slate-950/20 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    {monthNames[month]} {year}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                    type="button"
                    disabled={isPrevMonthDisabled()}
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous Month">
                    
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Next Month">
                    
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) =>
                <div
                  key={day}
                  className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase py-1">
                  
                      {day}
                    </div>
                )}

                  {calendarDays.map((cellDate, idx) => {
                  if (cellDate === null) {
                    return <div key={`empty-${idx}`} />;
                  }

                  const cellDateOnly = new Date(cellDate);
                  cellDateOnly.setHours(0, 0, 0, 0);

                  const isPast = cellDateOnly < today;
                  const isSunday = cellDate.getDay() === 0;
                  const dateStr = formatDate(cellDate);
                  const isSelected = selectedDate === dateStr;

                  const slotsCount = getAvailableTimeSlots(dateStr).length;
                  const isDisabled = isPast || isSunday;

                  return (
                    <button
                      type="button"
                      key={dateStr}
                      disabled={isDisabled}
                      onClick={() => selectDate(dateStr)}
                      className={cn(
                        'aspect-square flex flex-col items-center justify-center p-1 rounded-xl text-xs transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        isSelected ?
                        'bg-blue-600 text-white font-bold shadow-md' :
                        isDisabled ?
                        'opacity-30 cursor-not-allowed bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600' :
                        'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                      )}>
                      
                        <span>{cellDate.getDate()}</span>
                        {!isDisabled &&
                      <span
                        className={cn(
                          'text-[8px] font-bold mt-0.5 block',
                          isSelected ? 'text-blue-100' : 'text-emerald-600 dark:text-emerald-450'
                        )}>
                        
                            {slotsCount}{t("citizen.slots")}
                      </span>
                      }
                        {isSunday &&
                      <span className="text-[7px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">{t("citizen.no_opd")}

                      </span>
                      }
                      </button>);

                })}
                </div>
              </div>

              {/* Show friendly selected date */}
              <div className="flex items-center gap-2 p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                <CalendarIcon className="h-4.5 w-4.5 text-blue-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-350">
                  {selectedDate ?
                <>{t("citizen.selected_date")}
                  {' '}
                      <strong className="text-slate-900 dark:text-slate-100">
                        {formatFriendlyDate(selectedDate)}
                      </strong>
                    </> :

                'Please select a date from the calendar.'
                }
                </span>
              </div>
            </motion.div>
          }

          {step === 5 &&
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4">
            
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">{t("citizen.step_5_pick_time_slot")}

            </h4>
              {timeSlots.length > 0 ?
            <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot) =>
              <button
                type="button"
                key={slot}
                onClick={() => selectTime(slot)}
                className={cn(
                  'p-3 rounded-xl border-2 transition text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500',
                  selectedTime === slot ?
                  'border-blue-600 bg-blue-50/10 text-blue-600' :
                  'border-slate-100 dark:border-slate-850 hover:border-slate-355'
                )}>
                
                      {slot}
                    </button>
              )}
                </div> :

            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">{t("citizen.no_slots_available_on_this_date_please_go_back_and_select_another_date")}

            </div>
            }
            </motion.div>
          }

          {step === 6 &&
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5">
            
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">{t("citizen.step_6_review_finalize")}

            </h4>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">{t("citizen.hospital")}</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {selectedHospital?.hospitalName}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">{t("citizen.doctor_specialist")}</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {selectedDoctor?.doctorName}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">{t("citizen.opd_consultation_fee")}</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    ₹{selectedDoctor?.consultationFee}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">{t("citizen.date")}</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {formatFriendlyDate(selectedDate)}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">{t("citizen.estimated_slot")}</span>
                  <span className="text-slate-900 dark:text-slate-200">{selectedTime}</span>
                </div>
              </div>

              <button
              type="button"
              onClick={handleConfirm}
              disabled={bookMutation.isPending}
              className={cn(
                componentStyles.button.base,
                componentStyles.button.primary,
                'w-full py-3 disabled:opacity-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}>
              
                {bookMutation.isPending ?
              'Confirming Visit...' :
              'Confirm & Schedule Appointment'}
              </button>
            </motion.div>
          }

          {step === 7 && bookedDetails &&
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-6">
            
              <div className="mx-auto rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 p-4 h-16 w-16 flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-50">{t("citizen.appointment_scheduled")}

              </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("citizen.your_token_number_and_visit_confirmation_code_has_been_written_successfully_to_the_firestore")}


              </p>
              </div>

              <div className="max-w-xs mx-auto rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 text-xs text-left space-y-3 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("citizen.token_number")}</span>
                  <span className="text-blue-600 dark:text-blue-450 font-bold text-sm">
                    #{bookedDetails.tokenNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("citizen.specialist")}</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {selectedDoctor?.doctorName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("citizen.date")}</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {bookedDetails.appointmentDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("citizen.time")}</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {bookedDetails.appointmentTime}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                type="button"
                onClick={() => router.push('/dashboard/citizen/appointments')}
                className={cn(
                  componentStyles.button.base,
                  componentStyles.button.outline,
                  'px-5 py-2.5'
                )}>{t("citizen.manage_appointments")}


              </button>
                <button
                type="button"
                onClick={() => router.push('/dashboard/citizen')}
                className={cn(
                  componentStyles.button.base,
                  componentStyles.button.primary,
                  'px-5 py-2.5'
                )}>{t("citizen.go_to_dashboard")}


              </button>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* Wizard Navigation Footer */}
        {step <= 6 &&
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4 mt-4 select-none">
            {step > 1 ?
          <button
            type="button"
            onClick={handlePrev}
            className={cn(
              componentStyles.button.base,
              componentStyles.button.outline,
              'px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}>{t("citizen.back")}


          </button> :

          <div />
          }

            <span className="text-xs text-slate-400 font-semibold">{t("citizen.step")}{step}{t("citizen.of_6")}</span>

            {step < 6 ?
          <button
            type="button"
            onClick={handleNext}
            disabled={isNextDisabled()}
            className={cn(
              componentStyles.button.base,
              componentStyles.button.primary,
              'px-4 py-2 text-xs disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}>{t("citizen.continue")}


          </button> :

          <div />
          }
          </div>
        }
      </div>
    </motion.div>);

}