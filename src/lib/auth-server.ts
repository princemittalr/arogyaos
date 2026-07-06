import { adminAuth } from '@/firebase/admin';
import { APP_CONFIG } from '@/config/constants';
import { UserRole, isValidRole } from '@/config/roles';
import { NextRequest } from 'next/server';

export interface VerifiedSession {
  uid: string;
  role: UserRole;
  email?: string;
}

/**
 * Verifies the server-issued HttpOnly session cookie using Firebase Admin SDK.
 * Returns the verified session payload or null if invalid/expired.
 * This is the ONLY authoritative way to verify identity in API routes.
 */
export async function verifySessionCookie(
  request: NextRequest
): Promise<VerifiedSession | null> {
  try {
    const cookie = request.cookies.get(APP_CONFIG.sessionCookieName);
    if (!cookie?.value) return null;

    // Verify the session cookie cryptographically — checkRevoked = true
    const decoded = await adminAuth.verifySessionCookie(cookie.value, true);
    if (!decoded) return null;

    // Extract role from custom claims (set server-side by /api/auth/set-role)
    const role = decoded.role as string | undefined;

    // Strict role validation — reject tokens with unknown/missing roles
    if (!role || !isValidRole(role)) return null;

    return {
      uid: decoded.uid,
      role: role as UserRole,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

/**
 * Requires authentication. Returns verified session or throws a 401 Response.
 */
export async function requireAuth(
  request: NextRequest
): Promise<VerifiedSession> {
  const session = await verifySessionCookie(request);
  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}

/**
 * Requires authentication AND a specific set of allowed roles.
 * Returns verified session or throws a 401/403 Response.
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<VerifiedSession> {
  const session = await verifySessionCookie(request);
  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}
