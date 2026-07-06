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
 * Used here for automatic hourly token refreshes that Firebase performs.
 * Initial session creation on login/register is handled in auth.service.ts.
 */
async function createServerSession(idToken: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok) {
    throw new Error('Failed to refresh server session');
  }
}

/**
 * Delete the server HttpOnly session cookie.
 * AuthService.logout() calls this first. This is a safety-net for edge cases
 * (e.g. token expiry detected by onIdTokenChanged before an explicit logout).
 */
async function deleteServerSession(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch {
    // Intentionally silent
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Track the last token we issued a server session for to deduplicate calls.
  // auth.service.ts creates the initial session; we only update it on token refresh.
  const lastSessionTokenRef = useRef<string | null>(null);
  // Guard: track whether we are currently in a logout flow to prevent
  // onIdTokenChanged from re-creating a session while logout is in progress.
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setFbUser(firebaseUser);

      if (firebaseUser) {
        // Do not create a new session if we are in the middle of a logout flow.
        // This prevents the stale-token race: fbSignOut fires onIdTokenChanged
        // once more before the SDK fully clears state.
        if (isLoggingOutRef.current) {
          setLoading(false);
          return;
        }

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: data.fullName || firebaseUser.displayName || 'Healthcare User',
              role: data.role as UserRole,
              status: data.status || 'active',
            });

            // Only refresh the server session when the Firebase token actually
            // changes (i.e., on automatic hourly refresh). The initial session
            // was already created in auth.service.ts before router.push fired.
            const idToken = await firebaseUser.getIdToken();
            if (idToken !== lastSessionTokenRef.current) {
              lastSessionTokenRef.current = idToken;
              await createServerSession(idToken);
            }
          } else {
            // Transient state during new registration (batch.commit in progress)
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: firebaseUser.displayName || 'Healthcare User',
              role: 'citizen',
              status: 'active',
            });
          }
        } catch {
          setUser(null);
          lastSessionTokenRef.current = null;
          await deleteServerSession();
        }
      } else {
        // Firebase has fully signed out the user.
        setUser(null);
        lastSessionTokenRef.current = null;
        isLoggingOutRef.current = false; // reset for next login cycle

        // Safety-net: delete the server cookie in case AuthService.logout()
        // was not the initiator (e.g., token revocation by Firebase Console).
        await deleteServerSession();
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
