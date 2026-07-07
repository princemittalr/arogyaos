'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { VaccinationCertificate } from '../types';

export function useVaccinationCertificates(patientId: string) {
  const queryKey = ['vaccination_certificates', patientId];

  const queryResult = useQuery<VaccinationCertificate[]>({
    queryKey,
    queryFn: async () => {
      const q = query(
        collection(db, 'vaccination_certificates'),
        where('patientId', '==', patientId)
      );
      const snap = await getDocs(q);
      const records = snap.docs.map((d) => d.data() as VaccinationCertificate);
      
      return records.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    },
    enabled: !!patientId,
  });

  return {
    certificates: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
export default useVaccinationCertificates;
