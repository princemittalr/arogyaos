import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_CONFIG } from './config/constants';
import { getHomeRouteForRole } from './config/permissions';
import { UserRole, isValidRole } from './config/roles';

// ─── NOTE ON MIDDLEWARE SECURITY ──────────────────────────────────────────────
// Next.js Edge Middleware cannot run Firebase Admin SDK (Node.js runtime only).
// Therefore the middleware performs a lightweight "pre-filter" check:
//   • Presence of the session cookie (unauthenticated → redirect to login)
//   • Role-based path enforcement uses the custom claim embedded in the
//     HttpOnly session cookie, which is a Firebase-signed JWT issued by our
//     server-side /api/auth/session endpoint.
//
// The session cookie value is a Firebase session cookie (not a plain ID token).
// It contains a cryptographically signed payload. We decode (not verify) the
// payload here ONLY to extract the role for routing purposes. The actual
// cryptographic verification with revocation checking happens in every API
// route via verifySessionCookie() in src/lib/auth-server.ts.
//
// This is the industry-standard pattern for Next.js + Firebase when the Edge
// runtime cannot run the Node.js Admin SDK. The session cookie itself cannot
// be forged without Firebase's private key, so role extraction from the
// decoded payload is safe for routing decisions. Privileged actions in API
// routes are always re-verified server-side with adminAuth.verifySessionCookie().
// ──────────────────────────────────────────────────────────────────────────────

interface SessionClaims {
  uid?: string;  // present in Firebase ID tokens
  sub?: string;  // present in Firebase session cookies (same value as uid)
  role?: string;
  exp?: number;
}

function decodeSessionCookieClaims(cookie: string): SessionClaims | null {
  try {
    const parts = cookie.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** Returns the subject UID from either `uid` or `sub` (Firebase session cookies use `sub`). */
function getSubjectId(claims: SessionClaims): string | undefined {
  return claims.uid || claims.sub;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve the server-issued HttpOnly session cookie
  const sessionCookie = request.cookies.get(APP_CONFIG.sessionCookieName)?.value;

  // 1. Guard dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const claims = decodeSessionCookieClaims(sessionCookie);
    const subjectId = claims ? getSubjectId(claims) : undefined;

    // Check expiry and basic structural validity.
    // Use sub || uid — Firebase session cookies carry the UID in `sub`.
    if (!claims || !subjectId || (claims.exp && claims.exp * 1000 < Date.now())) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(APP_CONFIG.sessionCookieName);
      return response;
    }

    // Validate role before using it — reject tokens with unrecognised roles.
    // Do NOT delete the cookie here: it may be a valid session created just before
    // role claims were propagated. Redirect to login so the client can re-establish.
    const rawRole = claims.role;
    if (!rawRole || !isValidRole(rawRole)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = rawRole as UserRole;

    // Redirect /dashboard root to role-specific home
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(getHomeRouteForRole(role), request.url));
    }

    // Role-to-path mapping (single source of truth)
    const rolePaths: Record<string, string> = {
      citizen: '/dashboard/citizen',
      doctor: '/dashboard/doctor',
      hospital_admin: '/dashboard/hospital',
      nurse: '/dashboard/hospital',
      pharmacist: '/dashboard/pharmacy',
      lab_technician: '/dashboard/laboratory',
      district_admin: '/dashboard/district',
    };

    // super_admin can access any dashboard route
    if (role !== 'super_admin') {
      let isAuthorized = false;
      for (const [keyRole, prefix] of Object.entries(rolePaths)) {
        if (pathname.startsWith(prefix) && role === keyRole) {
          isAuthorized = true;
          break;
        }
      }

      if (!isAuthorized) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // 2. Redirect already-authenticated users away from auth pages
  if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
    const claims = decodeSessionCookieClaims(sessionCookie);
    const subjectId = claims ? getSubjectId(claims) : undefined;
    if (claims && subjectId && (!claims.exp || claims.exp * 1000 > Date.now())) {
      const rawRole = claims.role;
      if (rawRole && isValidRole(rawRole)) {
        return NextResponse.redirect(
          new URL(getHomeRouteForRole(rawRole as UserRole), request.url)
        );
      }
      // If role claim is absent but session is valid, let them through to login
      // so the client can re-establish the session with a fresh token
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
