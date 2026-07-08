import { describe, it, expect, vi, beforeEach } from 'vitest';
import { guardAiRoute } from './ai-guard';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

vi.mock('./auth-server', () => ({
  verifySessionCookie: vi.fn(),
}));

vi.mock('./rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

import { verifySessionCookie } from './auth-server';
import { checkRateLimit } from './rate-limit';

describe('ai-guard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockSchema = z.object({ input: z.string() });

  it('rejects unauthenticated requests', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue(null);
    const req = new NextRequest('http://localhost');
    const res = await guardAiRoute(req, ['doctor'], mockSchema);
    expect(res).toBeInstanceOf(NextResponse);
    if (res instanceof NextResponse) {
      expect(res.status).toBe(401);
    }
  });

  it('rejects unauthorized roles', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: '123', role: 'citizen' });
    const req = new NextRequest('http://localhost');
    const res = await guardAiRoute(req, ['doctor'], mockSchema);
    expect(res).toBeInstanceOf(NextResponse);
    if (res instanceof NextResponse) {
      expect(res.status).toBe(403);
    }
  });

  it('rejects rate-limited requests', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: '123', role: 'doctor' });
    vi.mocked(checkRateLimit).mockReturnValue(false);
    const req = new NextRequest('http://localhost');
    const res = await guardAiRoute(req, ['doctor'], mockSchema);
    expect(res).toBeInstanceOf(NextResponse);
    if (res instanceof NextResponse) {
      expect(res.status).toBe(429);
    }
  });

  it('rejects payload too large via headers', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: '123', role: 'doctor' });
    vi.mocked(checkRateLimit).mockReturnValue(true);
    const req = new NextRequest('http://localhost', {
      headers: { 'content-length': '999999' },
    });
    const res = await guardAiRoute(req, ['doctor'], mockSchema);
    expect(res).toBeInstanceOf(NextResponse);
    if (res instanceof NextResponse) {
      expect(res.status).toBe(413);
    }
  });
});
