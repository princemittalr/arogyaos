import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/client';
import {
  HospitalProfileDocument,
  DoctorProfileDocument,
  AppointmentDocument,
  InventoryDocument,
} from '@/firebase/types';

// Extended Interfaces
export interface DepartmentDocument {
  departmentId: string;
  hospitalId: string;
  departmentName: string;
  description: string;
  doctorCount: number;
  patientCount: number;
}

export interface DetailedDoctorWithUser extends DoctorProfileDocument {
  doctorName: string;
  email: string;
  departmentName: string;
  status: 'active' | 'inactive';
  workingHours: string;
  attendanceStatus: 'present' | 'absent' | 'on_leave';
}

export interface StaffDocument {
  staffId: string;
  hospitalId: string;
  fullName: string;
  email: string;
  role: 'nurse' | 'pharmacist' | 'receptionist' | 'lab_tech' | 'admin';
  departmentId: string;
  shift: 'morning' | 'evening' | 'night';
  status: 'active' | 'inactive';
}

export interface RoomDocument {
  roomId: string;
  hospitalId: string;
  roomNumber: string;
  roomType: 'icu' | 'general' | 'private' | 'semi-private';
  capacity: number;
  occupiedCount: number;
}

export interface BedDocument {
  bedId: string;
  roomId: string;
  hospitalId: string;
  bedNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  patientId?: string;
  patientName?: string;
  roomNumber?: string;
  roomType?: string;
}

export interface HospitalInventoryDocument extends InventoryDocument {
  category: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export interface LabTestDocument {
  testId: string;
  hospitalId: string;
  testName: string;
  category: string;
  cost: number;
  status: 'active' | 'inactive';
}

export interface DetailedPatient {
  patientId: string;
  fullName: string;
  email: string;
  age: number;
  gender: string;
  bloodGroup: string;
  status: 'admitted' | 'outpatient' | 'discharged';
  admissionDate?: string;
  roomNumber?: string;
  bedNumber?: string;
}

export class HospitalService {
  // ==========================================
  // 1. HOSPITAL PROFILE / SETTINGS
  // ==========================================
  static async getProfile(hospitalId: string): Promise<HospitalProfileDocument> {
    const docRef = doc(db, 'hospital_profiles', hospitalId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as HospitalProfileDocument;
    }

    // Default Fallback / Seed
    const defaultProfile: HospitalProfileDocument = {
      uid: 'hosp_admin_1',
      hospitalId,
      hospitalName: 'City General Hospital',
      districtId: 'dist_bengaluru',
      address: '123 MG Road, Bengaluru',
      location: { lat: 12.9716, lng: 77.5946 },
    };

    await setDoc(docRef, defaultProfile);
    return defaultProfile;
  }

  static async updateProfile(hospitalId: string, data: Partial<HospitalProfileDocument>): Promise<void> {
    const docRef = doc(db, 'hospital_profiles', hospitalId);
    await updateDoc(docRef, data);
  }

  // ==========================================
  // 2. DEPARTMENTS CRUD
  // ==========================================
  static async getDepartments(hospitalId: string): Promise<DepartmentDocument[]> {
    const collRef = collection(db, 'departments');
    const q = query(collRef, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Seed default departments
      const seedDepts: DepartmentDocument[] = [
        {
          departmentId: `${hospitalId}_cardio`,
          hospitalId,
          departmentName: 'Cardiology',
          description: 'Advanced cardiac diagnosis and therapies.',
          doctorCount: 4,
          patientCount: 28,
        },
        {
          departmentId: `${hospitalId}_neuro`,
          hospitalId,
          departmentName: 'Neurology',
          description: 'Surgical and medical neurological care.',
          doctorCount: 2,
          patientCount: 15,
        },
        {
          departmentId: `${hospitalId}_peds`,
          hospitalId,
          departmentName: 'Pediatrics',
          description: 'Infant, children, and adolescent care.',
          doctorCount: 3,
          patientCount: 32,
        },
        {
          departmentId: `${hospitalId}_gmed`,
          hospitalId,
          departmentName: 'General Medicine',
          description: 'Routine healthcare audits and OPD consultations.',
          doctorCount: 5,
          patientCount: 75,
        },
      ];

      const batch = writeBatch(db);
      for (const d of seedDepts) {
        batch.set(doc(db, 'departments', d.departmentId), d);
      }
      await batch.commit();
      return seedDepts;
    }

    return snap.docs.map((d) => d.data() as DepartmentDocument);
  }

  static async saveDepartment(dept: DepartmentDocument): Promise<void> {
    const docRef = doc(db, 'departments', dept.departmentId);
    await setDoc(docRef, dept, { merge: true });
  }

  static async deleteDepartment(departmentId: string): Promise<void> {
    const docRef = doc(db, 'departments', departmentId);
    await deleteDoc(docRef);
  }

  // ==========================================
  // 3. DOCTORS CRUD & ATTENDANCE
  // ==========================================
  static async getDoctors(hospitalId: string): Promise<DetailedDoctorWithUser[]> {
    const docProfilesColl = collection(db, 'doctor_profiles');
    const q = query(docProfilesColl, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);

    const doctorsList: DetailedDoctorWithUser[] = [];

    for (const docSnap of snap.docs) {
      const data = docSnap.data() as DoctorProfileDocument;
      // Get User Document for Name and Email
      const userRef = doc(db, 'users', data.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      // Mock working hours and attendance for production display
      doctorsList.push({
        ...data,
        doctorName: userData?.fullName || 'Dr. Specialist',
        email: userData?.email || 'specialist@arogya.in',
        departmentName: data.departmentId.split('_').pop() || 'General Medicine',
        status: 'active',
        workingHours: '09:00 AM - 05:00 PM',
        attendanceStatus: 'present',
      });
    }

    // Default seed doctors if none exist in the database for this hospital
    if (doctorsList.length === 0) {
      const seedDocProfiles = [
        {
          uid: 'doc_1',
          hospitalId,
          departmentId: `${hospitalId}_cardio`,
          specialization: 'Cardiologist',
          qualification: 'MD, DM Cardiology',
          consultationFee: 800,
          availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
          doctorName: 'Dr. Ramesh Kumar',
          email: 'ramesh.kumar@arogya.in',
        },
        {
          uid: 'doc_2',
          hospitalId,
          departmentId: `${hospitalId}_neuro`,
          specialization: 'Neurologist',
          qualification: 'MD, DM Neurology',
          consultationFee: 1000,
          availability: [{ dayOfWeek: 2, startTime: '10:00', endTime: '18:00' }],
          doctorName: 'Dr. Shalini Singh',
          email: 'shalini.singh@arogya.in',
        },
      ];

      const batch = writeBatch(db);
      for (const sd of seedDocProfiles) {
        // write to users
        const uRef = doc(db, 'users', sd.uid);
        batch.set(uRef, {
          uid: sd.uid,
          fullName: sd.doctorName,
          email: sd.email,
          role: 'doctor',
          status: 'active',
          createdAt: new Date().toISOString(),
        });

        // write to doctor profile
        const pRef = doc(db, 'doctor_profiles', sd.uid);
        batch.set(pRef, {
          uid: sd.uid,
          hospitalId: sd.hospitalId,
          departmentId: sd.departmentId,
          specialization: sd.specialization,
          qualification: sd.qualification,
          consultationFee: sd.consultationFee,
          availability: sd.availability,
        });

        doctorsList.push({
          uid: sd.uid,
          hospitalId: sd.hospitalId,
          departmentId: sd.departmentId,
          specialization: sd.specialization,
          qualification: sd.qualification,
          consultationFee: sd.consultationFee,
          availability: sd.availability,
          doctorName: sd.doctorName,
          email: sd.email,
          departmentName: sd.departmentId.split('_').pop() || 'General Medicine',
          status: 'active',
          workingHours: '09:00 AM - 05:00 PM',
          attendanceStatus: 'present',
        });
      }
      await batch.commit();
    }

    return doctorsList;
  }

  static async saveDoctor(docObj: Partial<DetailedDoctorWithUser>): Promise<void> {
    const batch = writeBatch(db);
    const uid = docObj.uid || `doc_${Date.now()}`;

    // Write to users
    if (docObj.doctorName || docObj.email) {
      const userRef = doc(db, 'users', uid);
      batch.set(
        userRef,
        {
          uid,
          fullName: docObj.doctorName || 'Dr. Specialist',
          email: docObj.email || `${uid}@arogya.in`,
          role: 'doctor',
          status: 'active',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    // Write to doctor profiles
    const profRef = doc(db, 'doctor_profiles', uid);
    batch.set(
      profRef,
      {
        uid,
        hospitalId: docObj.hospitalId,
        departmentId: docObj.departmentId || `${docObj.hospitalId}_gmed`,
        specialization: docObj.specialization || 'General',
        qualification: docObj.qualification || 'MBBS',
        consultationFee: docObj.consultationFee || 500,
        availability: docObj.availability || [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
      },
      { merge: true }
    );

    await batch.commit();
  }

  static async deleteDoctor(uid: string): Promise<void> {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'doctor_profiles', uid));
    batch.delete(doc(db, 'users', uid));
    await batch.commit();
  }

  // ==========================================
  // 4. STAFF CRUD
  // ==========================================
  static async getStaff(hospitalId: string): Promise<StaffDocument[]> {
    const collRef = collection(db, 'staff');
    const q = query(collRef, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const seedStaff: StaffDocument[] = [
        {
          staffId: `${hospitalId}_staff_1`,
          hospitalId,
          fullName: 'Arjun Nair',
          email: 'arjun.nair@arogya.in',
          role: 'nurse',
          departmentId: `${hospitalId}_cardio`,
          shift: 'morning',
          status: 'active',
        },
        {
          staffId: `${hospitalId}_staff_2`,
          hospitalId,
          fullName: 'Priya Pillai',
          email: 'priya.pillai@arogya.in',
          role: 'pharmacist',
          departmentId: `${hospitalId}_gmed`,
          shift: 'evening',
          status: 'active',
        },
        {
          staffId: `${hospitalId}_staff_3`,
          hospitalId,
          fullName: 'Vikas Rao',
          email: 'vikas.rao@arogya.in',
          role: 'lab_tech',
          departmentId: `${hospitalId}_neuro`,
          shift: 'night',
          status: 'active',
        },
      ];

      const batch = writeBatch(db);
      for (const s of seedStaff) {
        batch.set(doc(db, 'staff', s.staffId), s);
      }
      await batch.commit();
      return seedStaff;
    }

    return snap.docs.map((d) => d.data() as StaffDocument);
  }

  static async saveStaff(staff: StaffDocument): Promise<void> {
    const docRef = doc(db, 'staff', staff.staffId);
    await setDoc(docRef, staff, { merge: true });
  }

  static async deleteStaff(staffId: string): Promise<void> {
    const docRef = doc(db, 'staff', staffId);
    await deleteDoc(docRef);
  }

  // ==========================================
  // 5. PATIENTS DIRECTORY
  // ==========================================
  static async getPatients(hospitalId: string): Promise<DetailedPatient[]> {
    // Collect all patients who have scheduled/completed appointments at this hospital, or admitted profile
    const appointmentsColl = collection(db, 'appointments');
    const q = query(appointmentsColl, where('hospitalId', '==', hospitalId));
    const apptsSnap = await getDocs(q);

    const patientIds = Array.from(new Set(apptsSnap.docs.map((d) => (d.data() as AppointmentDocument).patientId)));
    const patientsList: DetailedPatient[] = [];

    for (const patientId of patientIds) {
      const userRef = doc(db, 'users', patientId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const profileRef = doc(db, 'patient_profiles', patientId);
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists() ? profileSnap.data() : null;

        patientsList.push({
          patientId,
          fullName: userData.fullName || 'Citizen Patient',
          email: userData.email || '',
          age: profileData?.age || 35,
          gender: profileData?.gender || 'female',
          bloodGroup: profileData?.bloodGroup || 'O+',
          status: 'outpatient',
        });
      }
    }

    // Seeding fallback patients if none found
    if (patientsList.length === 0) {
      const seedPatients: DetailedPatient[] = [
        {
          patientId: 'patient_seed_1',
          fullName: 'Karan Sharma',
          email: 'karan.sharma@gmail.com',
          age: 42,
          gender: 'male',
          bloodGroup: 'B+',
          status: 'admitted',
          admissionDate: '2026-07-01',
          roomNumber: '101',
          bedNumber: '101-A',
        },
        {
          patientId: 'patient_seed_2',
          fullName: 'Anjali Desai',
          email: 'anjali.desai@gmail.com',
          age: 28,
          gender: 'female',
          bloodGroup: 'A+',
          status: 'outpatient',
        },
      ];

      for (const sp of seedPatients) {
        // Save to users for matching query
        await setDoc(doc(db, 'users', sp.patientId), {
          uid: sp.patientId,
          fullName: sp.fullName,
          email: sp.email,
          role: 'citizen',
          status: 'active',
        });
        await setDoc(doc(db, 'patient_profiles', sp.patientId), {
          uid: sp.patientId,
          age: sp.age,
          gender: sp.gender,
          bloodGroup: sp.bloodGroup,
          allergies: [],
          emergencyContact: '9876543210',
          familyMembers: [],
        });
        patientsList.push(sp);
      }
    }

    return patientsList;
  }

  // ==========================================
  // 6. APPOINTMENTS MANAGEMENT
  // ==========================================
  static async getAppointments(hospitalId: string): Promise<AppointmentDocument[]> {
    const collRef = collection(db, 'appointments');
    const q = query(collRef, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AppointmentDocument);
  }

  static async rescheduleAppointment(appointmentId: string, date: string, time: string): Promise<void> {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, {
      appointmentDate: date,
      appointmentTime: time,
      status: 'scheduled',
    });
  }

  static async updateAppointmentStatus(appointmentId: string, status: AppointmentDocument['status']): Promise<void> {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, { status });
  }

  // ==========================================
  // 7. PHARMACY & INVENTORY CRUD
  // ==========================================
  static async getInventory(hospitalId: string): Promise<HospitalInventoryDocument[]> {
    const collRef = collection(db, 'inventory');
    const q = query(collRef, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const seedInventory: HospitalInventoryDocument[] = [
        {
          inventoryId: `${hospitalId}_med_1`,
          hospitalId,
          medicineId: 'med_paracetamol',
          medicineName: 'Paracetamol 650mg',
          quantity: 1200,
          minimumStock: 200,
          expiryDate: '2027-12-01',
          category: 'Analgesics',
          supplier: 'Arogya Pharma Dist',
          status: 'in_stock',
        },
        {
          inventoryId: `${hospitalId}_med_2`,
          hospitalId,
          medicineId: 'med_amoxicillin',
          medicineName: 'Amoxicillin 500mg',
          quantity: 85,
          minimumStock: 100,
          expiryDate: '2026-09-15',
          category: 'Antibiotics',
          supplier: 'BioPharma India',
          status: 'low_stock',
        },
        {
          inventoryId: `${hospitalId}_med_3`,
          hospitalId,
          medicineId: 'med_aspirin',
          medicineName: 'Aspirin 75mg',
          quantity: 450,
          minimumStock: 50,
          expiryDate: '2026-05-30',
          category: 'Cardiovascular',
          supplier: 'Arogya Pharma Dist',
          status: 'expired',
        },
      ];

      const batch = writeBatch(db);
      for (const item of seedInventory) {
        batch.set(doc(db, 'inventory', item.inventoryId), item);
      }
      await batch.commit();
      return seedInventory;
    }

    return snap.docs.map((d) => {
      const data = d.data() as HospitalInventoryDocument;
      let status: HospitalInventoryDocument['status'] = 'in_stock';
      if (data.quantity <= 0) {
        status = 'out_of_stock';
      } else if (data.quantity <= data.minimumStock) {
        status = 'low_stock';
      }

      // Check Expiry Date
      const expiry = new Date(data.expiryDate as string);
      if (expiry < new Date()) {
        status = 'expired';
      }

      return {
        ...data,
        status,
      };
    });
  }

  static async saveInventoryItem(item: HospitalInventoryDocument): Promise<void> {
    const docRef = doc(db, 'inventory', item.inventoryId);
    await setDoc(docRef, item, { merge: true });
  }

  static async deleteInventoryItem(inventoryId: string): Promise<void> {
    const docRef = doc(db, 'inventory', inventoryId);
    await deleteDoc(docRef);
  }

  // ==========================================
  // 8. ROOMS & BEDS CRUD
  // ==========================================
  static async getRooms(hospitalId: string): Promise<RoomDocument[]> {
    const collRef = collection(db, 'rooms');
    const q = query(collRef, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const seedRooms: RoomDocument[] = [
        {
          roomId: `${hospitalId}_room_101`,
          hospitalId,
          roomNumber: '101',
          roomType: 'icu',
          capacity: 4,
          occupiedCount: 2,
        },
        {
          roomId: `${hospitalId}_room_102`,
          hospitalId,
          roomNumber: '102',
          roomType: 'general',
          capacity: 8,
          occupiedCount: 4,
        },
        {
          roomId: `${hospitalId}_room_103`,
          hospitalId,
          roomNumber: '103',
          roomType: 'private',
          capacity: 1,
          occupiedCount: 1,
        },
      ];

      const batch = writeBatch(db);
      for (const r of seedRooms) {
        batch.set(doc(db, 'rooms', r.roomId), r);
      }
      await batch.commit();
      return seedRooms;
    }

    return snap.docs.map((d) => d.data() as RoomDocument);
  }

  static async saveRoom(room: RoomDocument): Promise<void> {
    const docRef = doc(db, 'rooms', room.roomId);
    await setDoc(docRef, room, { merge: true });
  }

  static async deleteRoom(roomId: string): Promise<void> {
    const docRef = doc(db, 'rooms', roomId);
    await deleteDoc(docRef);
  }

  static async getBeds(hospitalId: string): Promise<BedDocument[]> {
    const collRef = collection(db, 'beds');
    const q = query(collRef, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const seedBeds: BedDocument[] = [
        {
          bedId: `${hospitalId}_bed_101A`,
          roomId: `${hospitalId}_room_101`,
          hospitalId,
          bedNumber: '101-A',
          status: 'occupied',
          patientId: 'patient_seed_1',
          patientName: 'Karan Sharma',
        },
        {
          bedId: `${hospitalId}_bed_101B`,
          roomId: `${hospitalId}_room_101`,
          hospitalId,
          bedNumber: '101-B',
          status: 'available',
        },
        {
          bedId: `${hospitalId}_bed_102A`,
          roomId: `${hospitalId}_room_102`,
          hospitalId,
          bedNumber: '102-A',
          status: 'occupied',
          patientId: 'patient_seed_3',
          patientName: 'Sanjay Dutt',
        },
        {
          bedId: `${hospitalId}_bed_102B`,
          roomId: `${hospitalId}_room_102`,
          hospitalId,
          bedNumber: '102-B',
          status: 'available',
        },
      ];

      const batch = writeBatch(db);
      for (const b of seedBeds) {
        batch.set(doc(db, 'beds', b.bedId), b);
      }
      await batch.commit();
      return seedBeds;
    }

    const beds = snap.docs.map((d) => d.data() as BedDocument);
    const rooms = await this.getRooms(hospitalId);

    return beds.map((b) => {
      const roomMatch = rooms.find((r) => r.roomId === b.roomId);
      return {
        ...b,
        roomNumber: roomMatch?.roomNumber || 'Unknown',
        roomType: roomMatch?.roomType || 'general',
      };
    });
  }

  static async saveBed(bed: BedDocument): Promise<void> {
    const docRef = doc(db, 'beds', bed.bedId);
    await setDoc(docRef, bed, { merge: true });
  }

  static async deleteBed(bedId: string): Promise<void> {
    const docRef = doc(db, 'beds', bedId);
    await deleteDoc(docRef);
  }

  // ==========================================
  // 9. LABORATORY TEST REGISTRY
  // ==========================================
  static async getLabTests(hospitalId: string): Promise<LabTestDocument[]> {
    const collRef = collection(db, 'lab_tests');
    const q = query(collRef, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const seedTests: LabTestDocument[] = [
        {
          testId: `${hospitalId}_lab_cbc`,
          hospitalId,
          testName: 'Complete Blood Count (CBC)',
          category: 'Pathology',
          cost: 250,
          status: 'active',
        },
        {
          testId: `${hospitalId}_lab_lft`,
          hospitalId,
          testName: 'Liver Function Test (LFT)',
          category: 'Biochemistry',
          cost: 450,
          status: 'active',
        },
        {
          testId: `${hospitalId}_lab_xray`,
          hospitalId,
          testName: 'Chest X-Ray',
          category: 'Radiology',
          cost: 600,
          status: 'active',
        },
      ];

      const batch = writeBatch(db);
      for (const t of seedTests) {
        batch.set(doc(db, 'lab_tests', t.testId), t);
      }
      await batch.commit();
      return seedTests;
    }

    return snap.docs.map((d) => d.data() as LabTestDocument);
  }

  static async saveLabTest(test: LabTestDocument): Promise<void> {
    const docRef = doc(db, 'lab_tests', test.testId);
    await setDoc(docRef, test, { merge: true });
  }

  static async deleteLabTest(testId: string): Promise<void> {
    const docRef = doc(db, 'lab_tests', testId);
    await deleteDoc(docRef);
  }
}
export default HospitalService;
