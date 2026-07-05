import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_CONFIG } from './config/constants';
import { getHomeRouteForRole } from './config/permissions';
import { UserRole } from './config/roles';

// Decode a JWT token in the Edge runtime without external dependencies
function decodeFirebaseToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Base64Url decode the payload portion
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Retrieve the session cookie
  const sessionToken = request.cookies.get(APP_CONFIG.sessionCookieName)?.value;

  // 1. Guarding dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!sessionToken) {
      // Redirect unauthenticated requests to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const decoded = decodeFirebaseToken(sessionToken);
    
    // Check if token is expired
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(APP_CONFIG.sessionCookieName);
      return response;
    }

    const role = (decoded.role || 'citizen') as UserRole;

    // Direct dashboard home route matches
    if (pathname === '/dashboard') {
      const targetHome = getHomeRouteForRole(role);
      return NextResponse.redirect(new URL(targetHome, request.url));
    }

    // Role subpath verification rules
    const rolePaths: Record<string, string> = {
      citizen: '/dashboard/citizen',
      doctor: '/dashboard/doctor',
      hospital_admin: '/dashboard/hospital',
      nurse: '/dashboard/hospital',
      pharmacist: '/dashboard/pharmacy',
      lab_technician: '/dashboard/laboratory',
      district_admin: '/dashboard/district',
    };

    // If role is not super_admin, verify path authorization rules
    if (role !== 'super_admin') {
      let isAuthorized = false;
      
      // Match route path prefix
      for (const [keyRole, prefix] of Object.entries(rolePaths)) {
        if (pathname.startsWith(prefix) && role === keyRole) {
          isAuthorized = true;
          break;
        }
      }

      if (!isAuthorized) {
        // Redirect unauthorized users to the unauthorized route
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // 2. Guarding auth pages when user is already logged in
  if (sessionToken && (pathname === '/login' || pathname === '/register')) {
    const decoded = decodeFirebaseToken(sessionToken);
    if (decoded && (!decoded.exp || decoded.exp * 1000 > Date.now())) {
      const role = (decoded.role || 'citizen') as UserRole;
      const homeRoute = getHomeRouteForRole(role);
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }
  }

  return NextResponse.next();
}

// Intercept dashboard operations and login/register checks
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
