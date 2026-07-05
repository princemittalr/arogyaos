'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser, onIdTokenChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/client';
import { UserRole } from '@/config/roles';
import { APP_CONFIG } from '@/config/constants';

interface AuthUser {
  uid: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

interface AuthContextProps {
  user: AuthUser | null;
  loading: boolean;
  fbUser: FirebaseUser | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setFbUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user metadata role from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data();
            const profileUser: AuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: data.fullName || firebaseUser.displayName || 'Healthcare User',
              role: data.role as UserRole,
              status: data.status || 'active',
            };
            setUser(profileUser);

            // Sync auth token to Cookie for middleware verification
            const token = await firebaseUser.getIdToken();
            document.cookie = `${APP_CONFIG.sessionCookieName}=${token}; path=/; max-age=${APP_CONFIG.sessionMaxAge}; SameSite=Lax; Secure`;
          } else {
            // Fallback for new registration context before firestore records populate
            const fallbackUser: AuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: firebaseUser.displayName || 'Healthcare User',
              role: 'citizen',
              status: 'active',
            };
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error('Error fetching user document from Firestore:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        // Clear session cookie
        document.cookie = `${APP_CONFIG.sessionCookieName}=; path=/; max-age=0; SameSite=Lax; Secure`;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, fbUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export default AuthProvider;
