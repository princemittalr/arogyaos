import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifySessionCookie, requireAuth, requireRole } from './auth-server';
import { NextRequest } from 'next/server';
import { adminAuth } from '@/firebase/admin';

vi.mock('@/firebase/admin', () => ({
  adminAuth: {
    verifySessionCookie: vi.fn(),
  },
}));

vi.mock('@/config/constants', () => ({
  APP_CONFIG: {
    sessionCookieName: 'test-session',
  },
}));

describe('auth-server', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('verifySessionCookie returns null if no cookie', async () => {
    const req = new NextRequest('http://localhost');
    const result = await verifySessionCookie(req);
    expect(result).toBeNull();
  });

  it('verifySessionCookie returns payload if valid', async () => {
    const req = new NextRequest('http://localhost', {
      headers: { cookie: 'test-session=valid-token' },
    });
    vi.mocked(adminAuth.verifySessionCookie).mockResolvedValue({
      uid: '123',
      role: 'doctor',
      email: 'doc@test.com',
    } as any);

    const result = await verifySessionCookie(req);
    expect(result).toEqual({
      uid: '123',
      role: 'doctor',
      email: 'doc@test.com',
    });
  });

  it('requireAuth throws 401 if unauthenticated', async () => {
    const req = new NextRequest('http://localhost');
    await expect(requireAuth(req)).rejects.toThrow();
  });

  it('requireRole throws 403 if unauthorized', async () => {
    const req = new NextRequest('http://localhost', {
      headers: { cookie: 'test-session=valid-token' },
    });
    vi.mocked(adminAuth.verifySessionCookie).mockResolvedValue({
      uid: '123',
      role: 'citizen',
    } as any);

    await expect(requireRole(req, ['doctor'])).rejects.toThrow();
  });
});
