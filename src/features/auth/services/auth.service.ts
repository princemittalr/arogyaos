import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/client';
import { UserRole } from '@/config/roles';
import { UserDocument } from '@/firebase/types';
import { loginFormSchema } from '@/utils/validators';
import { z } from 'zod';
import {
  validateDoc,
  userDocSchema,
  patientProfileSchema,
  doctorProfileSchema,
  hospitalProfileSchema,
  districtProfileSchema
} from '@/firebase/validation';

type LoginParams = z.infer<typeof loginFormSchema>;

function getProfileCollectionName(role: UserRole): string {
  switch (role) {
    case 'citizen':      return 'patient_profiles';
    case 'doctor':       return 'doctor_profiles';
    case 'hospital_admin': return 'hospital_profiles';
    case 'district_admin': return 'district_profiles';
    default:             return 'patient_profiles';
  }
}

function getInitialProfileData(role: UserRole, uid: string, fullName: string) {
  switch (role) {
    case 'citizen':
      return { uid, age: 0, gender: 'other' as const, bloodGroup: '', allergies: [], emergencyContact: '', familyMembers: [] };
    case 'doctor':
      return { uid, hospitalId: '', departmentId: '', specialization: '', qualification: '', consultationFee: 0, availability: [] };
    case 'hospital_admin':
      return { uid, hospitalId: `hosp_${uid.slice(0, 5)}`, hospitalName: `${fullName}'s Hospital`, districtId: '', address: '', location: { lat: 0, lng: 0 } };
    case 'district_admin':
      return { uid, districtId: `dist_${uid.slice(0, 5)}`, districtName: `${fullName}'s District`, state: '' };
    default:
      return { uid };
  }
}

async function syncCustomClaims(token: string, role: UserRole): Promise<void> {
  const response = await fetch('/api/auth/set-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to sync authentication privileges.');
  }
}

/**
 * Exchange a Firebase ID token for a server-issued HttpOnly session cookie.
 * Called as the final step of every login/register flow so the cookie is
 * guaranteed to exist before router.push() navigates to the dashboard.
 */
async function createServerSession(token: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to establish server session.');
  }
}

/**
 * Delete the server-issued HttpOnly session cookie.
 * Never throws — logout must always succeed even if the server is slow.
 */
async function deleteServerSession(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch {
    // Intentionally silent — the cookie TTL will expire naturally
  }
}

export class AuthService {
  static async login(params: LoginParams): Promise<UserDocument> {
    const userCredential = await signInWithEmailAndPassword(auth, params.email, params.password);
    const { uid } = userCredential.user;

    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      throw new Error('User record does not exist in healthcare directory.');
    }

    const data = snap.data();
    if (data.status === 'inactive') {
      await fbSignOut(auth);
      throw new Error('This healthcare account has been deactivated.');
    }

    const role = data.role as UserRole;

    const idTokenResult = await userCredential.user.getIdTokenResult();
    if (idTokenResult.claims.role !== role) {
      const token = await userCredential.user.getIdToken();
      await syncCustomClaims(token, role);
      await userCredential.user.getIdToken(true);
    }

    // Session cookie must be set before returning so it exists before router.push
    const finalToken = await userCredential.user.getIdToken();
    await createServerSession(finalToken);

    return { uid, email: data.email, fullName: data.fullName, role, status: data.status, createdAt: data.createdAt };
  }

  /**
   * Complete logout:
   * 1. Delete the HttpOnly session cookie FIRST (before signOut).
   * 2. Sign out of Firebase (triggers onIdTokenChanged(null) in AuthProvider).
   *
   * Deleting the cookie first ensures that if the browser navigates while
   * onIdTokenChanged is still firing, middleware will not find a valid cookie
   * and will not allow dashboard access.
   */
  static async logout(): Promise<void> {
    // Step 1: clear the server session cookie synchronously before anything else
    await deleteServerSession();
    // Step 2: sign out of Firebase client (clears IndexedDB/localStorage state)
    await fbSignOut(auth);
  }

  static async register(): Promise<UserDocument> {
    throw new Error('Use registerWithPassword instead.');
  }

  static async registerWithPassword(
    email: string,
    fullName: string,
    role: UserRole,
    password: string
  ): Promise<UserDocument> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    await updateProfile(userCredential.user, { displayName: fullName });

    // Validate User Document
    const userDoc: UserDocument = { uid, email, fullName, role, status: 'active', createdAt: serverTimestamp() };
    validateDoc(userDocSchema, { ...userDoc, createdAt: new Date() });

    // Validate Profile Document
    const initialProfile = getInitialProfileData(role, uid, fullName);
    if (role === 'citizen') {
      validateDoc(patientProfileSchema, initialProfile);
    } else if (role === 'doctor') {
      validateDoc(doctorProfileSchema, initialProfile);
    } else if (role === 'hospital_admin') {
      validateDoc(hospitalProfileSchema, initialProfile);
    } else if (role === 'district_admin') {
      validateDoc(districtProfileSchema, initialProfile);
    }

    const batch = writeBatch(db);
    const userDocRef = doc(db, 'users', uid);
    batch.set(userDocRef, userDoc);

    const profileDocRef = doc(db, getProfileCollectionName(role), uid);
    batch.set(profileDocRef, initialProfile);
    await batch.commit();

    const token = await userCredential.user.getIdToken();
    await syncCustomClaims(token, role);
    await userCredential.user.getIdToken(true);

    const finalToken = await userCredential.user.getIdToken();
    await createServerSession(finalToken);

    return userDoc;
  }

}
export default AuthService;
