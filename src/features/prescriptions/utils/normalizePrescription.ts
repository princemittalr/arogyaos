import { PrescriptionRecord } from '../types';

export function normalizePrescription(d: any): PrescriptionRecord {
  let data: any;
  let docId = '';
  
  if (d && typeof d.data === 'function') {
    data = d.data();
    docId = d.id;
  } else {
    data = d;
  }

  if (!data) return data;

  const medicines = (data.medicines || []).map((med: any) => {
    if (med.schedule && typeof med.schedule.durationDays === 'number') {
      return med;
    }

    return {
      medicineId: med.medicineId || Math.random().toString(36).substring(7),
      name: med.name || 'Unknown Medicine',
      brandName: med.brandName || '',
      formulation: med.formulation || 'tablet',
      strength: med.strength || 'standard',
      dosage: med.dosage && typeof med.dosage === 'object' ? med.dosage : {
        pattern: typeof med.dosage === 'string' ? med.dosage : '1-0-1',
        quantityPerDose: 1,
        unit: 'pill',
        timing: typeof med.frequency === 'string' && med.frequency.toLowerCase().includes('before') ? 'before-meal' : 'after-meal'
      },
      schedule: med.schedule || {
        startDate: data.createdAt || new Date().toISOString(),
        endDate: data.validUntil || new Date().toISOString(),
        durationDays: med.durationDays ?? med.duration ?? 7,
        recurrence: 'daily'
      },
      instructions: med.instructions || med.frequency || ''
    };
  });

  return {
    ...data,
    recordId: data.recordId || data.prescriptionId || data.uuid || data.id || docId,
    ownerId: data.ownerId || data.patientId || data.citizenId,
    medicines,
  } as PrescriptionRecord;
}
