import { UserRole } from './roles';

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