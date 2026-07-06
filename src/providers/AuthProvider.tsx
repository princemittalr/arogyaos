'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User as FirebaseUser, onIdTokenChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/client';
import { UserRole } from '@/config/roles';

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

/**
 * Exchange a Firebase ID token for a server-set HttpOnly session cookie.
 * The cookie is written by the server — never by client-side JS — so it
 * cannot be stolen by XSS.
 */
async function createServerSession(idToken: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok) {
    throw new Error('Failed to create server session');
  }
}

/**
 * Ask the server to clear the HttpOnly session cookie.
 */
async function clearServerSession(): Promise<void> {
  await fetch('/api/auth/session', { method: 'DELETE' });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Track last token to avoid redundant session refreshes
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setFbUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user metadata from Firestore
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

            // Exchange the Firebase ID token for a server-issued HttpOnly session cookie.
            // The token is never written to document.cookie by the client.
            const idToken = await firebaseUser.getIdToken();
            if (idToken !== lastTokenRef.current) {
              lastTokenRef.current = idToken;
              await createServerSession(idToken);
            }
          } else {
            // Fallback during new registration before Firestore record exists
            const fallbackUser: AuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: firebaseUser.displayName || 'Healthcare User',
              role: 'citizen',
              status: 'active',
            };
            setUser(fallbackUser);
          }
        } catch {
          // Avoid logging error objects that may contain token data
          setUser(null);
          await clearServerSession();
        }
      } else {
        setUser(null);
        lastTokenRef.current = null;
        // Ask the server to clear the HttpOnly session cookie
        await clearServerSession();
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
