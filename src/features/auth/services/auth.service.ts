import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/client';
import { UserRole } from '@/config/roles';
import { UserDocument } from '@/firebase/types';
import { loginFormSchema } from '@/utils/validators';
import { z } from 'zod';

type LoginParams = z.infer<typeof loginFormSchema>;

function getProfileCollectionName(role: UserRole): string {
  switch (role) {
    case 'citizen':
      return 'patient_profiles';
    case 'doctor':
      return 'doctor_profiles';
    case 'hospital_admin':
      return 'hospital_profiles';
    case 'district_admin':
      return 'district_profiles';
    default:
      return 'patient_profiles';
  }
}

function getInitialProfileData(role: UserRole, uid: string, fullName: string) {
  switch (role) {
    case 'citizen':
      return {
        uid,
        age: 0,
        gender: 'other' as const,
        bloodGroup: '',
        allergies: [],
        emergencyContact: '',
        familyMembers: [],
      };
    case 'doctor':
      return {
        uid,
        hospitalId: '',
        departmentId: '',
        specialization: '',
        qualification: '',
        consultationFee: 0,
        availability: [],
      };
    case 'hospital_admin':
      return {
        uid,
        hospitalId: `hosp_${uid.slice(0, 5)}`,
        hospitalName: `${fullName}'s Hospital`,
        districtId: '',
        address: '',
        location: { lat: 0, lng: 0 },
      };
    case 'district_admin':
      return {
        uid,
        districtId: `dist_${uid.slice(0, 5)}`,
        districtName: `${fullName}'s District`,
        state: '',
      };
    default:
      return { uid };
  }
}

async function syncCustomClaims(token: string, role: UserRole): Promise<void> {
  const response = await fetch('/api/auth/set-role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to sync authentication privileges.');
  }
}

export class AuthService {
  static async login(params: LoginParams): Promise<UserDocument> {
    const userCredential = await signInWithEmailAndPassword(auth, params.email, params.password);
    const { uid } = userCredential.user;

    // Fetch user document to check status and load claims
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

    // Ensure custom claims are synchronized
    const idTokenResult = await userCredential.user.getIdTokenResult();
    if (idTokenResult.claims.role !== role) {
      const token = await userCredential.user.getIdToken();
      await syncCustomClaims(token, role);
      await userCredential.user.getIdToken(true); // force refresh claims
    }

    return {
      uid,
      email: data.email,
      fullName: data.fullName,
      role,
      status: data.status,
      createdAt: data.createdAt,
    };
  }

  static async logout(): Promise<void> {
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

    // Set displayName on auth profile
    await updateProfile(userCredential.user, { displayName: fullName });

    // Atomic batch write for user metadata and profile setup
    const batch = writeBatch(db);

    const userDocRef = doc(db, 'users', uid);
    const userDoc: UserDocument = {
      uid,
      email,
      fullName,
      role,
      status: 'active',
      createdAt: serverTimestamp(),
    };

    batch.set(userDocRef, userDoc);

    const profileColl = getProfileCollectionName(role);
    const profileDocRef = doc(db, profileColl, uid);
    batch.set(profileDocRef, getInitialProfileData(role, uid, fullName));

    await batch.commit();

    // Sync custom claims on server and force-refresh client token
    const token = await userCredential.user.getIdToken();
    await syncCustomClaims(token, role);
    await userCredential.user.getIdToken(true);

    return userDoc;
  }

  static async loginWithGoogle(): Promise<UserDocument> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const { uid, email, displayName } = userCredential.user;

    if (!email) {
      throw new Error('Google account is missing an email address.');
    }

    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.status === 'inactive') {
        await fbSignOut(auth);
        throw new Error('This account has been deactivated.');
      }

      const role = data.role as UserRole;
      const idTokenResult = await userCredential.user.getIdTokenResult();
      if (idTokenResult.claims.role !== role) {
        const token = await userCredential.user.getIdToken();
        await syncCustomClaims(token, role);
        await userCredential.user.getIdToken(true);
      }

      return {
        uid,
        email: data.email,
        fullName: data.fullName,
        role,
        status: data.status,
        createdAt: data.createdAt,
      };
    }

    // New Google Signup - Initialize as default citizen
    const fullName = displayName || 'Google User';
    const role: UserRole = 'citizen';
    const batch = writeBatch(db);

    const userDoc: UserDocument = {
      uid,
      email,
      fullName,
      role,
      status: 'active',
      createdAt: serverTimestamp(),
    };

    batch.set(userDocRef, userDoc);

    const profileDocRef = doc(db, 'patient_profiles', uid);
    batch.set(profileDocRef, getInitialProfileData(role, uid, fullName));

    await batch.commit();

    const token = await userCredential.user.getIdToken();
    await syncCustomClaims(token, role);
    await userCredential.user.getIdToken(true);

    return userDoc;
  }
}
export default AuthService;
