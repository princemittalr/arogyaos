'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Vaccination, VaccinationSchedule, VaccinationCertificate } from '../types';

export interface VaccinationTimelineEvent {
  id: string;
  type: 'scheduled' | 'administered' | 'verified' | 'adverse_event' | 'certificate_generated';
  title: string;
  description: string;
  date: Date;
  vaccineName: string;
  facilityName?: string;
  actorName?: string;
}

export function useVaccinationTimeline(patientId: string) {
  const queryResult = useQuery<VaccinationTimelineEvent[]>({
    queryKey: ['vaccination_timeline', patientId],
    queryFn: async () => {
      // 1. Fetch all records
      const vacQuery = query(collection(db, 'vaccinations'), where('patientId', '==', patientId));
      const schedQuery = query(collection(db, 'vaccination_schedules'), where('patientId', '==', patientId));
      const certQuery = query(collection(db, 'vaccination_certificates'), where('patientId', '==', patientId));

      const [vacSnap, schedSnap, certSnap] = await Promise.all([
        getDocs(vacQuery),
        getDocs(schedQuery),
        getDocs(certQuery),
      ]);

      const vaccinations = vacSnap.docs.map((d) => d.data() as Vaccination);
      const schedules = schedSnap.docs.map((d) => d.data() as VaccinationSchedule);
      const certificates = certSnap.docs.map((d) => d.data() as VaccinationCertificate);

      const events: VaccinationTimelineEvent[] = [];

      // 2. Map Schedules (Scheduled / Due events)
      schedules.forEach((s) => {
        events.push({
          id: `timeline-sched-${s.scheduleId}`,
          type: 'scheduled',
          title: `Vaccine Dose Scheduled`,
          description: `${s.vaccineName} (Dose ${s.doseNumber}/${s.totalDoses}) is scheduled or due.`,
          date: new Date(s.dueDate),
          vaccineName: s.vaccineName,
        });
      });

      // 3. Map Vaccinations (Administered, Verified, Adverse Events)
      vaccinations.forEach((v) => {
        if (v.administeredAt) {
          events.push({
            id: `timeline-admin-${v.vaccinationId}`,
            type: 'administered',
            title: `Vaccine Administered`,
            description: `${v.vaccineName} (Dose ${v.doseNumber}/${v.totalDoses}) was successfully administered.`,
            date: new Date(v.administeredAt),
            vaccineName: v.vaccineName,
            facilityName: v.facilityName,
            actorName: v.administeredBy,
          });
        }

        if (v.status === 'verified') {
          events.push({
            id: `timeline-ver-${v.vaccinationId}`,
            type: 'verified',
            title: `Vaccine Dose Verified`,
            description: `${v.vaccineName} (Dose ${v.doseNumber}/${v.totalDoses}) dose was verified by a certified healthcare professional.`,
            date: new Date((v.administeredAt || v.metadata?.createdAt || new Date()) as string | number | Date),
            vaccineName: v.vaccineName,
          });
        }

        if (v.adverseEvent) {
          events.push({
            id: `timeline-ae-${v.vaccinationId}`,
            type: 'adverse_event',
            title: `Adverse Reaction Logged (${v.adverseEvent.severity.toUpperCase()})`,
            description: `Symptoms reported: ${v.adverseEvent.symptoms}`,
            date: new Date(v.adverseEvent.reportedAt),
            vaccineName: v.vaccineName,
            actorName: v.adverseEvent.reporterName,
          });
        }
      });

      // 4. Map Certificates (Certificate Issued events)
      certificates.forEach((c) => {
        events.push({
          id: `timeline-cert-${c.certificateId}`,
          type: 'certificate_generated',
          title: `Verification Certificate Issued`,
          description: `Digital immunization certificate ${c.certificateNumber} generated and signed.`,
          date: new Date(c.generatedAt),
          vaccineName: c.vaccineName,
          facilityName: c.facilityName,
          actorName: c.verifierSignature,
        });
      });

      // Sort timeline events chronologically (newest first)
      return events.sort((a, b) => b.date.getTime() - a.date.getTime());
    },
    enabled: !!patientId,
  });

  return {
    events: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
export default useVaccinationTimeline;
