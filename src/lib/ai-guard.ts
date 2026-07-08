import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, VerifiedSession } from '@/lib/auth-server';
import { UserRole } from '@/config/roles';
import { checkRateLimit } from './rate-limit';
import { z } from 'zod';

// Maximum allowed request body size for AI endpoints (bytes)
export const AI_PAYLOAD_MAX_BYTES = 64 * 1024; // 64 KB

/**
 * Reads and validates the request body for AI routes.
 * Enforces authentication, role-based access, rate-limiting, and payload validation.
 *
 * @param request - Incoming Next.js request
 * @param allowedRoles - Roles permitted to access this endpoint
 * @param schema - Zod schema for validating the incoming request body
 * @returns Tuple of [session, parsedBody] or a NextResponse error
 */
export async function guardAiRoute<T>(
  request: NextRequest,
  allowedRoles: UserRole[],
  schema: z.Schema<T>
): Promise<[VerifiedSession, T] | NextResponse> {
  // 1. Authentication check
  const session = await verifySessionCookie(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Role authorization check
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Rate limiting check (Role-aware)
  if (!checkRateLimit(session.uid, session.role)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 4. Payload size enforcement (prevent quota abuse / DoS)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > AI_PAYLOAD_MAX_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  // 5. Parse and validate JSON body using Zod
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

  const parseResult = schema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Malformed request', details: parseResult.error.issues },
      { status: 400 }
    );
  }

  return [session, parseResult.data];
}
