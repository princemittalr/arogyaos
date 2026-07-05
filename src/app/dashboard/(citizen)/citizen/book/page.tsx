'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  useHospitals,
  useDoctors,
  useBookAppointmentMutation,
} from '@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { AppointmentDocument } from '@/firebase/types';
import { Check } from 'lucide-react';

export default function CitizenBookPage() {
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
  const departments = selectedHospitalId
    ? Array.from(
        new Set(
          doctors?.filter((d) => d.hospitalId === selectedHospitalId).map((d) => d.departmentId)
        )
      )
    : [];

  // Available doctors based on hospital and department
  const filteredDoctors = doctors?.filter(
    (d) => d.hospitalId === selectedHospitalId && d.departmentId === selectedDept
  );

  // Mock available time slots
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
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
        time: selectedTime,
      });
      setBookedDetails(res);
      setStep(7); // Success step
    } catch {
      // toast is automatically triggered by hook mutation
    }
  };

  // Steps headers mapping
  const stepsTitles = [
    'Select Hospital',
    'Select Department',
    'Select Doctor',
    'Select Date',
    'Select Time Slot',
    'Review & Confirm',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <PageHeader
        title="Outpatient Appointment Booking"
        description="Schedule consult visits and diagnostic sessions with state-authorized specialists."
      />

      {/* Progress Steps Indicators (1 to 6) */}
      {step <= 6 && (
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
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30'
                      : 'bg-slate-100 text-slate-450 dark:bg-slate-900'
                  )}
                >
                  {isCompleted ? <Check className="h-4.5 w-4.5" /> : stepNum}
                </div>
                {idx < 5 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 transition-all duration-300',
                      step > stepNum ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Booking Form steps viewbox */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">Step 1: Select Facility</h4>
              <div className="space-y-3">
                {hospitals?.map((h) => (
                  <div
                    key={h.hospitalId}
                    onClick={() => {
                      setSelectedHospitalId(h.hospitalId);
                      handleNext();
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 transition cursor-pointer text-left',
                      selectedHospitalId === h.hospitalId
                        ? 'border-blue-600 bg-blue-50/10'
                        : 'border-slate-100 dark:border-slate-850 hover:border-slate-355'
                    )}
                  >
                    <span className="font-bold text-sm text-slate-850 dark:text-slate-100 block">
                      {h.hospitalName}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">{h.address}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">Step 2: Choose Department</h4>
              <div className="grid grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDept(dept);
                      handleNext();
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 transition text-center font-bold text-sm',
                      selectedDept === dept
                        ? 'border-blue-600 bg-blue-50/10 text-blue-600'
                        : 'border-slate-100 dark:border-slate-850 hover:border-slate-355'
                    )}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">Step 3: Select Specialist</h4>
              <div className="space-y-3">
                {filteredDoctors?.map((d) => (
                  <div
                    key={d.uid}
                    onClick={() => {
                      setSelectedDoctorId(d.uid);
                      handleNext();
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 transition cursor-pointer text-left flex justify-between items-center',
                      selectedDoctorId === d.uid
                        ? 'border-blue-600 bg-blue-50/10'
                        : 'border-slate-100 dark:border-slate-850 hover:border-slate-355'
                    )}
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                        {d.doctorName}
                      </span>
                      <span className="text-xs text-slate-450 block">{d.qualification}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450">
                      ₹{d.consultationFee}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">Step 4: Select Appointment Date</h4>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  handleNext();
                }}
                className={cn(componentStyles.input.base, 'w-full py-3 text-sm font-semibold')}
              />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">Step 5: Pick Time Slot</h4>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedTime(slot);
                      handleNext();
                    }}
                    className={cn(
                      'p-3 rounded-xl border-2 transition text-center text-xs font-bold',
                      selectedTime === slot
                        ? 'border-blue-600 bg-blue-50/10 text-blue-600'
                        : 'border-slate-100 dark:border-slate-850 hover:border-slate-355'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">Step 6: Review & Finalize</h4>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Hospital</span>
                  <span className="text-slate-900 dark:text-slate-200">{selectedHospital?.hospitalName}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Doctor Specialist</span>
                  <span className="text-slate-900 dark:text-slate-200">{selectedDoctor?.doctorName}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">OPD Consultation Fee</span>
                  <span className="text-slate-900 dark:text-slate-200">₹{selectedDoctor?.consultationFee}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-900 dark:text-slate-200">{selectedDate}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Estimated Slot</span>
                  <span className="text-slate-900 dark:text-slate-200">{selectedTime}</span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={bookMutation.isPending}
                className={cn(
                  componentStyles.button.base,
                  componentStyles.button.primary,
                  'w-full py-3 disabled:opacity-50 text-xs font-bold'
                )}
              >
                {bookMutation.isPending ? 'Confirming Visit...' : 'Confirm & Schedule Appointment'}
              </button>
            </motion.div>
          )}

          {step === 7 && bookedDetails && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-6"
            >
              <div className="mx-auto rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 p-4 h-16 w-16 flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-50">
                  Appointment Scheduled!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your token number and visit confirmation code has been written successfully to the Firestore.
                </p>
              </div>

              <div className="max-w-xs mx-auto rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 text-xs text-left space-y-3 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Token Number</span>
                  <span className="text-blue-600 dark:text-blue-450 font-bold text-sm">
                    #{bookedDetails.tokenNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialist</span>
                  <span className="text-slate-900 dark:text-slate-200">{selectedDoctor?.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-900 dark:text-slate-200">{bookedDetails.appointmentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time</span>
                  <span className="text-slate-900 dark:text-slate-200">{bookedDetails.appointmentTime}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => router.push('/dashboard/citizen/appointments')}
                  className={cn(componentStyles.button.base, componentStyles.button.outline, 'px-5 py-2.5')}
                >
                  Manage Appointments
                </button>
                <button
                  onClick={() => router.push('/dashboard/citizen')}
                  className={cn(componentStyles.button.base, componentStyles.button.primary, 'px-5 py-2.5')}
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous step CTA */}
        {step > 1 && step <= 6 && (
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
            <button
              onClick={handlePrev}
              className={cn(componentStyles.button.base, componentStyles.button.outline, 'px-4 py-2 text-xs')}
            >
              Back
            </button>
            <span className="text-xs text-slate-400 font-semibold self-center">
              Step {step} of 6
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
