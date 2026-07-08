import { UserRole } from '@/config/roles';

export interface UserDocument {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: unknown; // Firestore Timestamp
  updatedAt?: unknown;
}

export interface PatientProfileDocument {
  uid: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  allergies: string[];
  emergencyContact: string;
  familyMembers: Array<{
    fullName: string;
    relation: string;
    age: number;
  }>;
}

export interface DoctorProfileDocument {
  uid: string;
  hospitalId: string;
  departmentId: string;
  specialization: string;
  qualification: string;
  consultationFee: number;
  availability: Array<{
    dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
    startTime: string; // "HH:MM"
    endTime: string;
  }>;
}

export interface HospitalProfileDocument {
  uid: string; // admin owner id
  hospitalId: string;
  hospitalName: string;
  districtId: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phone?: string;
  email?: string;
  emergencyThreshold?: number;
  generalThreshold?: number;
}

export interface DistrictProfileDocument {
  uid: string; // district admin owner id
  districtId: string;
  districtName: string;
  state: string;
}

export interface AppointmentDocument {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  status: 'scheduled' | 'checked_in' | 'completed' | 'cancelled';
  tokenNumber: number;
  createdAt: unknown;
}

export interface PrescriptionDocument {
  recordId: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  diagnosis: string;
  medicines: Array<{
    medicineId: string;
    name: string;
    dosage: string; // e.g. "1-0-1"
    frequency: string;
    duration: number; // days
  }>;
  labTests: string[];
  createdAt: unknown;
}

export interface InventoryDocument {
  inventoryId: string; // hospitalId_medicineId
  hospitalId: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  minimumStock: number;
  expiryDate: unknown;
}
