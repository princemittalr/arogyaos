import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/admin';
import { isValidRole } from '@/config/roles';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cryptographically verify the Firebase ID token; check revocation
    let uid: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token, true);
      uid = decodedToken.uid;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    let role: unknown;
    try {
      const body = await request.json();
      role = body?.role;
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Use the canonical isValidRole() — single source of truth for role validation
    if (typeof role !== 'string' || !isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Verify that the requested role matches what Firestore has for this user
    // to prevent privilege escalation
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDocSnap.data();
    if (!userData || userData.role !== role) {
      // Return 403 but do NOT reveal which side mismatched to prevent enumeration
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Set custom user claims on the Firebase Auth account
    await adminAuth.setCustomUserClaims(uid, { role });

    return NextResponse.json({ success: true });
  } catch {
    // Never expose internal errors to the client
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
