import { UserRole } from './roles';
import { db } from '@/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

export const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string }> = {
  citizen: {
    email: 'citizen.demo@gmail.com',
    password: 'Demo@12345',
  },
  doctor: {
    email: 'doctor.demo@gmail.com',
    password: 'Demo@12345',
  },
  nurse: {
    email: 'nurse.demo@gmail.com',
    password: 'Demo@12345',
  },
  lab_technician: {
    email: 'lab.demo@gmail.com',
    password: 'Demo@12345',
  },
  pharmacist: {
    email: 'pharmacy.demo@gmail.com',
    password: 'Demo@12345',
  },
  hospital_admin: {
    email: 'hospital.demo@gmail.com',
    password: 'Demo@12345',
  },
  district_admin: {
    email: 'district.demo@gmail.com',
    password: 'Demo@12345',
  },
  state_admin: {
    email: 'state.demo@gmail.com',
    password: 'Demo@12345',
  },
  super_admin: {
    email: 'admin.demo@gmail.com',
    password: 'Demo@12345',
  },
  asha_worker: {
    email: 'asha.demo@gmail.com',
    password: 'Demo@12345',
  },
};

export const DEMO_EMAILS = Object.values(DEMO_ACCOUNTS).map((acc) => acc.email);

export function isDemoUser(email: string | null | undefined | { email?: string | null }): boolean {
  if (!email) return false;
  const emailStr = typeof email === 'string' ? email : email.email;
  if (!emailStr) return false;
  return DEMO_EMAILS.includes(emailStr);
}

export async function isDemoUserId(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return false;
    return isDemoUser(userSnap.data().email);
  } catch (error) {
    return false;
  }
}