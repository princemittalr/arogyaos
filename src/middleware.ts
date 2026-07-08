import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_CONFIG } from './config/constants';
import { getHomeRouteForRole } from './config/permissions';
import { UserRole } from './config/roles';

// ─── NOTE ON MIDDLEWARE SECURITY ──────────────────────────────────────────────
// Next.js Edge Middleware cannot run Firebase Admin SDK (Node.js runtime only).
// Therefore, the middleware calls a centralized verifier API route
// (/api/auth/verify) to validate the session cookie cryptographically.
// ──────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
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

    // Call centralized verifier
    const verifyUrl = new URL('/api/auth/verify', request.url);
    const verifyResponse = await fetch(verifyUrl.toString(), {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!verifyResponse.ok) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(APP_CONFIG.sessionCookieName);
      return response;
    }

    const session = await verifyResponse.json();
    const role = session.role as UserRole;

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
    const verifyUrl = new URL('/api/auth/verify', request.url);
    const verifyResponse = await fetch(verifyUrl.toString(), {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (verifyResponse.ok) {
      const session = await verifyResponse.json();
      return NextResponse.redirect(
        new URL(getHomeRouteForRole(session.role as UserRole), request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
