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
  PatientProfileDocument,
  AppointmentDocument,
  HospitalProfileDocument,
  DoctorProfileDocument,
  PrescriptionDocument,
  UserDocument,
} from '@/firebase/types';
import {
  validateDoc,
  patientProfileSchema,
  doctorProfileSchema,
  hospitalProfileSchema,
  appointmentSchema,
  prescriptionSchema,
  labReportSchema,
  notificationSchema,
} from '@/firebase/validation';

export interface CombinedPatientProfile extends PatientProfileDocument {
  fullName: string;
  email: string;
}

export interface DetailedDoctor extends DoctorProfileDocument {
  doctorName: string;
  hospitalName: string;
}

export interface DetailedAppointment extends AppointmentDocument {
  doctorName: string;
  hospitalName: string;
}

export interface LabReportDocument {
  id: string;
  patientId: string;
  reportName: string;
  labName: string;
  testDate: string;
  status: string;
  results: Record<string, string>;
}

export interface NotificationDocument {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export class CitizenService {
  // 1. PROFILE CRUD
  static async getProfile(uid: string): Promise<CombinedPatientProfile> {
    const userDocRef = doc(db, 'users', uid);
    const profileDocRef = doc(db, 'patient_profiles', uid);

    const [userSnap, profileSnap] = await Promise.all([
      getDoc(userDocRef),
      getDoc(profileDocRef),
    ]);

    if (!userSnap.exists()) {
      throw new Error('User account not found.');
    }

    const userData = userSnap.data() as UserDocument;
    const profileData = profileSnap.exists()
      ? (profileSnap.data() as PatientProfileDocument)
      : {
          uid,
          age: 0,
          gender: 'other' as const,
          bloodGroup: '',
          allergies: [],
          emergencyContact: '',
          familyMembers: [],
        };

    return {
      ...profileData,
      fullName: userData.fullName,
      email: userData.email,
    };
  }

  static async updateProfile(uid: string, data: Partial<CombinedPatientProfile>): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    const profileDocRef = doc(db, 'patient_profiles', uid);

    const [userSnap, profileSnap] = await Promise.all([
      getDoc(userDocRef),
      getDoc(profileDocRef),
    ]);

    if (!userSnap.exists()) {
      throw new Error('User account not found.');
    }

    const currentProfile = profileSnap.exists()
      ? (profileSnap.data() as PatientProfileDocument)
      : {
          uid,
          age: 0,
          gender: 'other' as const,
          bloodGroup: '',
          allergies: [],
          emergencyContact: '',
          familyMembers: [],
        };

    const updatedProfile: PatientProfileDocument = {
      uid,
      age: data.age !== undefined ? data.age : currentProfile.age,
      gender: data.gender !== undefined ? data.gender : currentProfile.gender,
      bloodGroup: data.bloodGroup !== undefined ? data.bloodGroup : currentProfile.bloodGroup,
      allergies: data.allergies !== undefined ? data.allergies : currentProfile.allergies,
      emergencyContact: data.emergencyContact !== undefined ? data.emergencyContact : currentProfile.emergencyContact,
      familyMembers: currentProfile.familyMembers || [],
    };

    validateDoc(patientProfileSchema, updatedProfile);

    const batch = writeBatch(db);

    if (data.fullName) {
      batch.update(userDocRef, { fullName: data.fullName });
    }

    batch.set(profileDocRef, updatedProfile);

    await batch.commit();
  }

  // 2. FAMILY MEMBERS CRUD
  static async getFamilyMembers(
    uid: string
  ): Promise<PatientProfileDocument['familyMembers']> {
    const profile = await this.getProfile(uid);
    return profile.familyMembers || [];
  }

  static async addFamilyMember(
    uid: string,
    member: { fullName: string; relation: string; age: number }
  ): Promise<void> {
    const profileDocRef = doc(db, 'patient_profiles', uid);
    const profile = await this.getProfile(uid);
    const currentMembers = profile.familyMembers || [];

    const updatedProfile: PatientProfileDocument = {
      uid,
      age: profile.age,
      gender: profile.gender,
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      emergencyContact: profile.emergencyContact,
      familyMembers: [...currentMembers, member],
    };

    validateDoc(patientProfileSchema, updatedProfile);

    await updateDoc(profileDocRef, {
      familyMembers: updatedProfile.familyMembers,
    });
  }

  static async removeFamilyMember(uid: string, fullName: string): Promise<void> {
    const profileDocRef = doc(db, 'patient_profiles', uid);
    const profile = await this.getProfile(uid);
    const filteredMembers = (profile.familyMembers || []).filter(
      (m) => m.fullName !== fullName
    );

    const updatedProfile: PatientProfileDocument = {
      uid,
      age: profile.age,
      gender: profile.gender,
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      emergencyContact: profile.emergencyContact,
      familyMembers: filteredMembers,
    };

    validateDoc(patientProfileSchema, updatedProfile);

    await updateDoc(profileDocRef, {
      familyMembers: updatedProfile.familyMembers,
    });
  }

  // 3. HOSPITALS SEARCH & SEED
  static async getHospitals(): Promise<HospitalProfileDocument[]> {
    const hospColl = collection(db, 'hospital_profiles');
    const snap = await getDocs(hospColl);

    if (snap.empty) {
      // Seed initial hospitals
      const seedHospitals: HospitalProfileDocument[] = [
        {
          uid: 'hosp_admin_1',
          hospitalId: 'hosp_city_gen',
          hospitalName: 'City General Hospital',
          districtId: 'dist_bengaluru',
          address: '123 MG Road, Bengaluru',
          location: { lat: 12.9716, lng: 77.5946 },
        },
        {
          uid: 'hosp_admin_2',
          hospitalId: 'hosp_st_marys',
          hospitalName: 'St. Marys Healthcare',
          districtId: 'dist_chennai',
          address: '456 Residency Road, Chennai',
          location: { lat: 13.0827, lng: 80.2707 },
        },
        {
          uid: 'hosp_admin_3',
          hospitalId: 'hosp_arogya',
          hospitalName: 'Arogya Wellness Centre',
          districtId: 'dist_hyderabad',
          address: '789 Ring Road, Hyderabad',
          location: { lat: 17.385, lng: 78.4867 },
        },
      ];

      const batch = writeBatch(db);
      for (const hosp of seedHospitals) {
        validateDoc(hospitalProfileSchema, hosp);
        const docRef = doc(db, 'hospital_profiles', hosp.hospitalId);
        batch.set(docRef, hosp);
      }
      await batch.commit();
      return seedHospitals;
    }

    return snap.docs.map((d) => d.data() as HospitalProfileDocument);
  }

  // 4. DOCTORS SEARCH & SEED
  static async getDoctors(): Promise<DetailedDoctor[]> {
    const docColl = collection(db, 'doctor_profiles');
    const snap = await getDocs(docColl);

    if (snap.empty) {
      // Seed initial doctor records (plus user names)
      const seedDoctors: DetailedDoctor[] = [
        {
          uid: 'doc_1',
          hospitalId: 'hosp_city_gen',
          departmentId: 'Cardiology',
          specialization: 'Cardiologist',
          qualification: 'MD, DM (Cardiology)',
          consultationFee: 500,
          availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '13:00' }],
          doctorName: 'Dr. Rajesh Sharma',
          hospitalName: 'City General Hospital',
        },
        {
          uid: 'doc_2',
          hospitalId: 'hosp_st_marys',
          departmentId: 'Pediatrics',
          specialization: 'Pediatrician',
          qualification: 'MBBS, MD (Pediatrics)',
          consultationFee: 400,
          availability: [{ dayOfWeek: 2, startTime: '14:00', endTime: '18:00' }],
          doctorName: 'Dr. Priya Nair',
          hospitalName: 'St. Marys Healthcare',
        },
        {
          uid: 'doc_3',
          hospitalId: 'hosp_arogya',
          departmentId: 'Dermatology',
          specialization: 'Dermatologist',
          qualification: 'MD (Dermatology)',
          consultationFee: 600,
          availability: [{ dayOfWeek: 3, startTime: '10:00', endTime: '16:00' }],
          doctorName: 'Dr. Amit Patel',
          hospitalName: 'Arogya Wellness Centre',
        },
      ];

      const batch = writeBatch(db);
      for (const docObj of seedDoctors) {
        const profileRef = doc(db, 'doctor_profiles', docObj.uid);
        const userRef = doc(db, 'users', docObj.uid);

        // Save doc profile
        const profileOnly = {
          uid: docObj.uid,
          hospitalId: docObj.hospitalId,
          departmentId: docObj.departmentId,
          specialization: docObj.specialization,
          qualification: docObj.qualification,
          consultationFee: docObj.consultationFee,
          availability: docObj.availability,
        };
        validateDoc(doctorProfileSchema, profileOnly);
        batch.set(profileRef, profileOnly);

        // Save user record
        batch.set(userRef, {
          uid: docObj.uid,
          fullName: docObj.doctorName,
          email: `${docObj.uid}@arogya.in`,
          role: 'doctor',
          status: 'active',
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
      return seedDoctors;
    }

    const doctorsList = snap.docs.map((d) => d.data() as DoctorProfileDocument);
    const hospitals = await this.getHospitals();

    // Map names from user profiles
    const detailed: DetailedDoctor[] = [];
    for (const docObj of doctorsList) {
      const userSnap = await getDoc(doc(db, 'users', docObj.uid));
      const doctorName = userSnap.exists() ? userSnap.data().fullName : 'Consultant Doctor';
      const hospitalName =
        hospitals.find((h) => h.hospitalId === docObj.hospitalId)?.hospitalName || 'Health Center';

      detailed.push({
        ...docObj,
        doctorName,
        hospitalName,
      });
    }

    return detailed;
  }

  // 5. APPOINTMENTS CRUD
  static async getAppointments(patientId: string): Promise<DetailedAppointment[]> {
    const q = query(collection(db, 'appointments'), where('patientId', '==', patientId));
    const snap = await getDocs(q);

    const appointments = snap.docs.map((d) => d.data() as AppointmentDocument);
    const doctors = await this.getDoctors();

    return appointments.map((appt) => {
      const doctorMatch = doctors.find((docObj) => docObj.uid === appt.doctorId);
      return {
        ...appt,
        doctorName: doctorMatch ? doctorMatch.doctorName : 'Healthcare Consultant',
        hospitalName: doctorMatch ? doctorMatch.hospitalName : 'General Clinic',
      };
    });
  }

  static async bookAppointment(
    patientId: string,
    doctorId: string,
    hospitalId: string,
    date: string,
    time: string
  ): Promise<AppointmentDocument> {
    const appointmentId = `appt_${Math.random().toString(36).substring(2, 9)}`;
    const docRef = doc(db, 'appointments', appointmentId);

    const appointment: AppointmentDocument = {
      appointmentId,
      patientId,
      doctorId,
      hospitalId,
      appointmentDate: date,
      appointmentTime: time,
      status: 'scheduled',
      tokenNumber: Math.floor(Math.random() * 30) + 1,
      createdAt: new Date().toISOString(),
    };

    validateDoc(appointmentSchema, appointment);

    await setDoc(docRef, appointment);
    return appointment;
  }

  static async cancelAppointment(appointmentId: string): Promise<void> {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, { status: 'cancelled' });
  }

  static async rescheduleAppointment(
    appointmentId: string,
    date: string,
    time: string
  ): Promise<void> {
    const docRef = doc(db, 'appointments', appointmentId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Appointment not found.');
    }
    const currentAppt = docSnap.data() as AppointmentDocument;
    const updatedAppt = {
      ...currentAppt,
      appointmentDate: date,
      appointmentTime: time,
      status: 'scheduled' as const,
    };

    validateDoc(appointmentSchema, updatedAppt);

    await updateDoc(docRef, {
      appointmentDate: date,
      appointmentTime: time,
      status: 'scheduled',
    });
  }

  // 6. PRESCRIPTIONS CRUD & SEED
  static async getPrescriptions(patientId: string): Promise<PrescriptionDocument[]> {
    const q = query(collection(db, 'prescriptions'), where('patientId', '==', patientId));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Seed a prescription
      const samplePrescription: PrescriptionDocument = {
        prescriptionId: 'pres_sample_123',
        appointmentId: 'appt_sample',
        doctorId: 'doc_1',
        patientId,
        diagnosis: 'Mild hypertension and viral fatigue',
        medicines: [
          { medicineId: 'med_1', name: 'Paracetamol', dosage: '1-0-1', frequency: 'After meals', duration: 5 },
          { medicineId: 'med_2', name: 'Amlodipine', dosage: '0-0-1', frequency: 'Before bed', duration: 30 },
        ],
        labTests: ['Complete Blood Count (CBC)', 'Electrocardiogram (ECG)'],
        createdAt: new Date().toISOString(),
      };

      validateDoc(prescriptionSchema, samplePrescription);

      await setDoc(doc(db, 'prescriptions', samplePrescription.prescriptionId), samplePrescription);
      return [samplePrescription];
    }

    return snap.docs.map((d) => d.data() as PrescriptionDocument);
  }

  // 7. LAB REPORTS CRUD & SEED
  static async getReports(patientId: string): Promise<LabReportDocument[]> {
    const q = query(collection(db, 'lab_reports'), where('patientId', '==', patientId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const sampleReports: LabReportDocument[] = [
        {
          id: 'report_1',
          patientId,
          reportName: 'Complete Blood Count (CBC)',
          labName: 'Central Diagnostics Bengaluru',
          testDate: '2026-06-20',
          status: 'completed',
          results: {
            Hemoglobin: '14.2 g/dL',
            WBC: '7,500 /mcL',
            Platelets: '280,000 /mcL',
          },
        },
        {
          id: 'report_2',
          patientId,
          reportName: 'Lipid Profile',
          labName: 'Apollo Diagnostics Chennai',
          testDate: '2026-05-15',
          status: 'completed',
          results: {
            Cholesterol: '185 mg/dL',
            Triglycerides: '130 mg/dL',
            HDL: '52 mg/dL',
          },
        },
      ];

      const batch = writeBatch(db);
      for (const r of sampleReports) {
        validateDoc(labReportSchema, r);
        batch.set(doc(db, 'lab_reports', r.id), r);
      }
      await batch.commit();
      return sampleReports;
    }

    return snap.docs.map((d) => d.data() as LabReportDocument);
  }

  // 8. NOTIFICATIONS CRUD & SEED
  static async getNotifications(userId: string): Promise<NotificationDocument[]> {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const sampleNotifications: NotificationDocument[] = [
        {
          id: 'notif_1',
          userId,
          title: 'Welcome to ArogyaOS',
          message: 'Your unified healthcare operating profile is active and synced.',
          time: '2 days ago',
          read: false,
        },
        {
          id: 'notif_2',
          userId,
          title: 'OPD Schedule Update',
          message: 'City General Hospital updated weekly cardiologist OPD timeslots.',
          time: '1 day ago',
          read: true,
        },
      ];

      const batch = writeBatch(db);
      for (const n of sampleNotifications) {
        validateDoc(notificationSchema, n);
        batch.set(doc(db, 'notifications', n.id), n);
      }
      await batch.commit();
      return sampleNotifications;
    }

    return snap.docs.map((d) => d.data() as NotificationDocument);
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
  }
}
export default CitizenService;
