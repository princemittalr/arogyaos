import { normalizePrescription } from '@/features/prescriptions/utils/normalizePrescription';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase/client';
import {
  DoctorProfileDocument,
  AppointmentDocument,
  PrescriptionDocument,
  UserDocument,
  PatientProfileDocument,
} from '@/firebase/types';
import {
  validateDoc,
  doctorProfileSchema,
  prescriptionSchema
} from '@/firebase/validation';

export interface DetailedDoctorProfile extends DoctorProfileDocument {
  fullName: string;
  email: string;
  hospitalName?: string;
  departmentName?: string;
  experienceYears?: number;
  phone?: string;
  bio?: string;
}

export interface DetailedPatientProfile extends PatientProfileDocument {
  fullName: string;
  email: string;
  phone?: string;
  admissionStatus?: 'admitted' | 'outpatient' | 'discharged';
  medicalHistory?: Array<{
    date: string;
    condition: string;
    treatment: string;
    notes?: string;
  }>;
  labReports?: Array<{
    reportId: string;
    reportName: string;
    labName: string;
    testDate: string;
    status: 'pending' | 'completed' | 'cancelled';
    results?: Record<string, string>;
  }>;
  vitals?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    updatedAt: string;
  };
}

export interface DetailedDoctorAppointment extends AppointmentDocument {
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientBloodGroup?: string;
  patientAllergies?: string[];
  diagnosis?: string;
  symptoms?: string;
  clinicalNotes?: string;
}

export interface LabOrderDocument {
  orderId: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  testNames: string[];
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface FollowUpDocument {
  followUpId: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  followUpDate: string;
  status: 'upcoming' | 'completed' | 'missed';
  notes?: string;
  createdAt: string;
}

export class DoctorService {
  static async getProfile(uid: string): Promise<DetailedDoctorProfile> {
    const docRef = doc(db, 'doctor_profiles', uid);
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const defaultProfile: DoctorProfileDocument = {
        uid,
        hospitalId: 'hosp_city_gen',
        departmentId: 'dept_cardio',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD (Cardiology)',
        consultationFee: 750,
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
        ],
      };
      validateDoc(doctorProfileSchema, defaultProfile);
      await setDoc(docRef, defaultProfile);
      docSnap = await getDoc(docRef);

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().role !== 'doctor') {
        await updateDoc(userRef, { role: 'doctor' });
      }
    }

    const profileData = docSnap.data() as DoctorProfileDocument;

    const userSnap = await getDoc(doc(db, 'users', uid));
    const userData = userSnap.exists() ? (userSnap.data() as UserDocument) : null;

    return {
      ...profileData,
      fullName: userData?.fullName || 'Dr. Aarav Mehta',
      email: userData?.email || `${uid}@arogya.in`,
      hospitalName: 'City General Hospital',
      departmentName: 'Cardiology Clinic',
      experienceYears: 12,
      phone: '+91 98765 43210',
      bio: 'Senior Consultant Cardiologist with 12+ years of experience specializing in preventive care, heart failure diagnostics, and micro-vascular interventions.',
    };
  }

  static async updateProfile(uid: string, data: Partial<DetailedDoctorProfile>): Promise<void> {
    const docRef = doc(db, 'doctor_profiles', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Doctor profile not found.');
    }
    const currentProfile = docSnap.data() as DoctorProfileDocument;
    const updatedProfile = {
      ...currentProfile,
      specialization: data.specialization !== undefined ? data.specialization : currentProfile.specialization,
      qualification: data.qualification !== undefined ? data.qualification : currentProfile.qualification,
      consultationFee: data.consultationFee !== undefined ? data.consultationFee : currentProfile.consultationFee,
      availability: data.availability !== undefined ? data.availability : currentProfile.availability,
    };

    validateDoc(doctorProfileSchema, updatedProfile);

    await updateDoc(docRef, {
      specialization: updatedProfile.specialization,
      qualification: updatedProfile.qualification,
      consultationFee: updatedProfile.consultationFee,
      availability: updatedProfile.availability,
    });

    const userUpdates: { fullName?: string } = {};
    if (data.fullName !== undefined) userUpdates.fullName = data.fullName;
    if (Object.keys(userUpdates).length > 0) {
      await updateDoc(doc(db, 'users', uid), userUpdates);
    }
  }

  static async getQueue(uid: string): Promise<DetailedDoctorAppointment[]> {
    await this.ensureSeededData(uid);

    const q = query(collection(db, 'appointments'), where('doctorId', '==', uid));
    const snap = await getDocs(q);
    const appointments = snap.docs.map((d) => d.data() as AppointmentDocument);

    const detailed: DetailedDoctorAppointment[] = [];
    for (const appt of appointments) {
      const patientUserSnap = await getDoc(doc(db, 'users', appt.patientId));
      const patientProfileSnap = await getDoc(doc(db, 'patient_profiles', appt.patientId));

      const patientUser = patientUserSnap.exists() ? patientUserSnap.data() : null;
      const patientProfile = patientProfileSnap.exists() ? (patientProfileSnap.data() as PatientProfileDocument) : null;

      detailed.push({
        ...appt,
        patientName: patientUser?.fullName || 'Anonymous Patient',
        patientAge: patientProfile?.age || 35,
        patientGender: patientProfile?.gender || 'male',
        patientBloodGroup: patientProfile?.bloodGroup || 'O+',
        patientAllergies: patientProfile?.allergies || [],
      });
    }

    return detailed.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }

  static async getPatients(uid: string): Promise<DetailedPatientProfile[]> {
    await this.ensureSeededData(uid);

    const appointments = await this.getQueue(uid);
    const patientIds = Array.from(new Set(appointments.map((a) => a.patientId)));

    const patientsList: DetailedPatientProfile[] = [];
    for (const pId of patientIds) {
      const pDetails = await this.getPatientDetails(pId);
      patientsList.push(pDetails);
    }
    return patientsList;
  }

  static async getPatientDetails(patientId: string): Promise<DetailedPatientProfile> {
    const userSnap = await getDoc(doc(db, 'users', patientId));
    const profileSnap = await getDoc(doc(db, 'patient_profiles', patientId));

    const userData = userSnap.exists() ? userSnap.data() : null;
    const profileData = profileSnap.exists() ? (profileSnap.data() as PatientProfileDocument) : null;

    // Fetch vitals and histories (can also fetch mock sub-collection or default values)
    return {
      uid: patientId,
      age: profileData?.age || 40,
      gender: profileData?.gender || 'male',
      bloodGroup: profileData?.bloodGroup || 'B+',
      allergies: profileData?.allergies || ['None'],
      emergencyContact: profileData?.emergencyContact || '+91 99999 88888',
      familyMembers: profileData?.familyMembers || [],
      fullName: userData?.fullName || 'Citizen Patient',
      email: userData?.email || `${patientId}@arogyaOS.in`,
      phone: '+91 90000 12345',
      admissionStatus: 'outpatient',
      vitals: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        weight: 68,
        updatedAt: new Date().toISOString().split('T')[0],
      },
      medicalHistory: [
        { date: '2026-02-14', condition: 'Acute Bronchitis', treatment: 'Azithromycin course', notes: 'Completed 5-day therapy, resolved fully.' },
        { date: '2025-10-10', condition: 'Hypertension Screening', treatment: 'Lifestyle modification', notes: 'Advised sodium reduction.' },
      ],
      labReports: [
        { reportId: `rep_${patientId}_1`, reportName: 'Complete Blood Count', labName: 'City Pathology Lab', testDate: '2026-05-15', status: 'completed', results: { Hemoglobin: '14.2 g/dL', WBC: '6,500 /uL' } },
        { reportId: `rep_${patientId}_2`, reportName: 'Lipid Profile', labName: 'City Pathology Lab', testDate: '2026-06-01', status: 'completed', results: { Cholesterol: '190 mg/dL', Triglycerides: '130 mg/dL' } },
      ],
    };
  }

  static async saveConsultation(
    appointmentId: string,
    data: {
      doctorId: string;
      patientId: string;
      symptoms: string;
      diagnosis: string;
      clinicalNotes: string;
      medicines: Array<{
        medicineId: string;
        name: string;
        dosage: string;
        frequency: string;
        duration: number;
      }>;
      labTests?: string[];
      followUpDate?: string;
    }
  ): Promise<void> {
    // Validate appointment exists and is not already completed/cancelled
    const apptRef = doc(db, 'appointments', appointmentId);
    const apptSnap = await getDoc(apptRef);
    if (!apptSnap.exists()) {
      throw new Error('Appointment does not exist.');
    }
    const apptData = apptSnap.data();
    if (apptData.status === 'completed') {
      throw new Error('This appointment has already been completed.');
    }
    if (apptData.status === 'cancelled') {
      throw new Error('This appointment has been cancelled.');
    }

    // 1. Create prescription document
    const recordId = `presc_${Date.now()}`;
    const prescRef = doc(db, 'prescriptions', recordId);
    const prescription: PrescriptionDocument = {
      recordId,
      appointmentId,
      doctorId: data.doctorId,
      patientId: data.patientId,
      diagnosis: data.diagnosis,
      medicines: data.medicines,
      labTests: data.labTests || [],
      createdAt: new Date().toISOString(),
    };
    validateDoc(prescriptionSchema, prescription);

    const batch = writeBatch(db);
    batch.set(prescRef, prescription);

    // 2. Create lab orders if needed
    if (data.labTests && data.labTests.length > 0) {
      const orderId = `lab_${Date.now()}`;
      const orderRef = doc(db, 'lab_orders', orderId);
      const patientUserSnap = await getDoc(doc(db, 'users', data.patientId));
      const patientName = patientUserSnap.exists() ? patientUserSnap.data().fullName : 'Patient';

      const labOrder: LabOrderDocument = {
        orderId,
        appointmentId,
        doctorId: data.doctorId,
        patientId: data.patientId,
        patientName,
        testNames: data.labTests,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      batch.set(orderRef, labOrder);
    }

    // 3. Create follow-up reminder if date provided
    if (data.followUpDate) {
      const followUpId = `fup_${Date.now()}`;
      const fupRef = doc(db, 'follow_ups', followUpId);
      const patientUserSnap = await getDoc(doc(db, 'users', data.patientId));
      const patientName = patientUserSnap.exists() ? patientUserSnap.data().fullName : 'Patient';

      const followUp: FollowUpDocument = {
        followUpId,
        appointmentId,
        doctorId: data.doctorId,
        patientId: data.patientId,
        patientName,
        followUpDate: data.followUpDate,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      };
      batch.set(fupRef, followUp);
    }

    // 4. Update appointment status to completed
    batch.update(apptRef, {
      status: 'completed',
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      clinicalNotes: data.clinicalNotes,
    });

    await batch.commit();
  }

  static async getPrescriptions(doctorId: string): Promise<PrescriptionDocument[]> {
    const q = query(collection(db, 'prescriptions'), where('doctorId', '==', doctorId));
    const snap = await getDocs(q);
    
    return snap.docs.map((d) => normalizePrescription(d) as unknown as PrescriptionDocument);
  }

  static async getLabOrders(doctorId: string): Promise<LabOrderDocument[]> {
    const q = query(collection(db, 'lab_orders'), where('doctorId', '==', doctorId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LabOrderDocument);
  }

  static async getFollowUps(doctorId: string): Promise<FollowUpDocument[]> {
    const q = query(collection(db, 'follow_ups'), where('doctorId', '==', doctorId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FollowUpDocument);
  }

  // Seeding routine for standard testing compatibility
  private static async ensureSeededData(doctorId: string): Promise<void> {
    const apptQ = query(collection(db, 'appointments'), where('doctorId', '==', doctorId));
    const apptSnap = await getDocs(apptQ);

    if (apptSnap.empty) {
      const batch = writeBatch(db);
      const todayStr = new Date().toISOString().split('T')[0];

      const patients = [
        { id: `pat_rohan_${doctorId.slice(0, 4)}`, name: 'Rohan Sharma', age: 45, gender: 'male' as const, bg: 'A+', allergies: ['Penicillin'] },
        { id: `pat_priya_${doctorId.slice(0, 4)}`, name: 'Priya Patel', age: 32, gender: 'female' as const, bg: 'O-', allergies: ['None'] },
        { id: `pat_amit_${doctorId.slice(0, 4)}`, name: 'Amit Verma', age: 60, gender: 'male' as const, bg: 'AB+', allergies: ['Sulfa Drugs'] },
      ];

      // Seed Patient Users & Profiles
      for (const p of patients) {
        const uRef = doc(db, 'users', p.id);
        batch.set(uRef, {
          uid: p.id,
          fullName: p.name,
          email: `${p.id}@arogyaOS.org`,
          role: 'citizen',
          status: 'active',
          createdAt: serverTimestamp(),
        });

        const pRef = doc(db, 'patient_profiles', p.id);
        batch.set(pRef, {
          uid: p.id,
          age: p.age,
          gender: p.gender,
          bloodGroup: p.bg,
          allergies: p.allergies,
          emergencyContact: '+91 91111 22222',
          familyMembers: [],
        });
      }

      // Seed Appointments
      const times = ['09:30 AM', '11:00 AM', '02:30 PM'];
      for (let i = 0; i < patients.length; i++) {
        const apptId = `appt_${doctorId.slice(0, 4)}_${i}`;
        const apptRef = doc(db, 'appointments', apptId);
        batch.set(apptRef, {
          appointmentId: apptId,
          patientId: patients[i].id,
          doctorId,
          hospitalId: 'hosp_city_gen',
          appointmentDate: todayStr,
          appointmentTime: times[i],
          status: i === 0 ? 'checked_in' : 'scheduled',
          tokenNumber: i + 1,
          createdAt: new Date().toISOString(),
        });
      }

      await batch.commit();
    }
  }
}
export default DoctorService;
