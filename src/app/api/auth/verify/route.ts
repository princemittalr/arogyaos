import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const session = await verifySessionCookie(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(session);
}
