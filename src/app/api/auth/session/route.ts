import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/admin';
import { APP_CONFIG } from '@/config/constants';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// POST /api/auth/session — Exchange a Firebase ID token for a server-set HttpOnly session cookie.
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1].trim();
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the Firebase ID token with the Admin SDK (cryptographic signature check)
    const decoded = await adminAuth.verifyIdToken(idToken, true); // checkRevoked = true
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create a long-lived Firebase session cookie (server-signed)
    const expiresIn = APP_CONFIG.sessionMaxAge * 1000; // convert seconds → ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: APP_CONFIG.sessionCookieName,
      value: sessionCookie,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      maxAge: APP_CONFIG.sessionMaxAge,
      path: '/',
    });

    return response;
  } catch {
    // Do NOT expose internal error details
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

// DELETE /api/auth/session — Clear the HttpOnly session cookie (logout).
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: APP_CONFIG.sessionCookieName,
    value: '',
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
