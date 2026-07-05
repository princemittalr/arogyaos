import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/admin';
import { UserRole } from '@/config/roles';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid } = decodedToken;

    const { role } = (await request.json()) as { role: UserRole };

    // Verify role is one of the valid application roles
    const validRoles: UserRole[] = [
      'citizen',
      'doctor',
      'hospital_admin',
      'nurse',
      'pharmacist',
      'lab_technician',
      'district_admin',
      'super_admin',
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    // Verify role against Firestore to prevent privilege escalation
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return NextResponse.json({ error: 'User directory record not found' }, { status: 404 });
    }

    const userData = userDocSnap.data();
    if (!userData) {
      return NextResponse.json({ error: 'Empty user directory record' }, { status: 500 });
    }

    if (userData.role !== role) {
      return NextResponse.json(
        { error: 'Privilege escalation attempt: role mismatch' },
        { status: 403 }
      );
    }

    // Set custom user claims
    await adminAuth.setCustomUserClaims(uid, { role });

    return NextResponse.json({ success: true, uid, role });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error setting custom claims:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
