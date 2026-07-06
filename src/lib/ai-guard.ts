import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, VerifiedSession } from '@/lib/auth-server';
import { UserRole } from '@/config/roles';

// Maximum allowed request body size for AI endpoints (bytes)
export const AI_PAYLOAD_MAX_BYTES = 64 * 1024; // 64 KB

/**
 * Reads and validates the request body for AI routes.
 * Enforces authentication, role-based access, and payload size limits.
 *
 * @param request - Incoming Next.js request
 * @param allowedRoles - Roles permitted to access this endpoint
 * @returns Tuple of [session, parsedBody] or a NextResponse error
 */
export async function guardAiRoute(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<[VerifiedSession, unknown] | NextResponse> {
  // 1. Authentication check
  const session = await verifySessionCookie(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Role authorization check
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Payload size enforcement (prevent quota abuse / DoS)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > AI_PAYLOAD_MAX_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  // 4. Parse and validate JSON body
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > AI_PAYLOAD_MAX_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  return [session, body];
}
