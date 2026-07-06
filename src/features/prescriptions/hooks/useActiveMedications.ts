'use client';

import { useMemo } from 'react';
import { PrescriptionRecord, MedicationItem } from '../types';

export interface ActiveMedication {
  medicine: MedicationItem;
  prescriptionId: string;
  doctorName: string;
  hospitalName: string;
  progressPercentage: number;
  daysRemaining: number;
  totalDays: number;
}

function resolveDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'object' && 'toDate' in val) {
    const obj = val as { toDate?: () => unknown };
    if (typeof obj.toDate === 'function') {
      const date = obj.toDate();
      if (date instanceof Date) {
        return date;
      }
    }
  }
  return new Date(val as string | number);
}

export function useActiveMedications(prescriptions: PrescriptionRecord[]) {
  const activeMedications = useMemo(() => {
    if (!prescriptions) return [];

    const now = new Date();
    const activeList: ActiveMedication[] = [];

    // Filter for active prescriptions
    const activePrescriptions = prescriptions.filter(
      (rx) => rx.status === 'Active' && rx.metadata?.status === 'ACTIVE'
    );

    for (const rx of activePrescriptions) {
      for (const med of rx.medicines) {
        const start = resolveDate(med.schedule.startDate);
        const end = resolveDate(med.schedule.endDate);

        // Check if the current date lies within the treatment schedule
        if (now >= start && now <= end) {
          const totalMs = end.getTime() - start.getTime();
          const elapsedMs = now.getTime() - start.getTime();
          const progress = totalMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)) : 0;

          const remainingMs = end.getTime() - now.getTime();
          const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));

          activeList.push({
            medicine: med,
            prescriptionId: rx.recordId,
            doctorName: rx.doctorName,
            hospitalName: rx.hospitalName,
            progressPercentage: Math.round(progress),
            daysRemaining,
            totalDays: med.schedule.durationDays,
          });
        }
      }
    }

    return activeList;
  }, [prescriptions]);

  // Group by daily time targets (morning, afternoon, evening) if specified
  const groupedByTime = useMemo(() => {
    const groups: Record<string, ActiveMedication[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      custom: [],
    };

    activeMedications.forEach((med) => {
      const pattern = med.medicine.dosage.pattern; // e.g. "1-0-1", "0-0-1"
      if (pattern && pattern.includes('-')) {
        const parts = pattern.split('-');
        if (parts[0] === '1') groups.morning.push(med);
        if (parts[1] === '1') groups.afternoon.push(med);
        if (parts[2] === '1') groups.evening.push(med);
      } else {
        groups.custom.push(med);
      }
    });

    return groups;
  }, [activeMedications]);

  return {
    activeMedications,
    groupedByTime,
  };
}
export default useActiveMedications;
