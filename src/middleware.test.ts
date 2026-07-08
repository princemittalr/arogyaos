import { describe, it, expect, vi, beforeEach } from 'vitest';
import { middleware } from './middleware';
import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from './config/constants';

global.fetch = vi.fn();

describe('middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('redirects to login if accessing dashboard without cookie', async () => {
    const req = new NextRequest('http://localhost/dashboard');
    const res = await middleware(req);
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirects to login if verifier fails', async () => {
    const req = new NextRequest('http://localhost/dashboard/doctor');
    req.cookies.set(APP_CONFIG.sessionCookieName, 'token');
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
    } as any);

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('allows access to specific dashboard route if authorized', async () => {
    const req = new NextRequest('http://localhost/dashboard/doctor');
    req.cookies.set(APP_CONFIG.sessionCookieName, 'token');
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ role: 'doctor' }),
    } as any);

    const res = await middleware(req);
    // NextResponse.next() returns a response with no location header and status 200 (or internal 307 if rewrites). 
    // We check that it didn't redirect to login or unauthorized.
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects unauthorized users away from /dashboard to unauthorized page', async () => {
    const req = new NextRequest('http://localhost/dashboard/hospital');
    req.cookies.set(APP_CONFIG.sessionCookieName, 'token');
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ role: 'citizen' }),
    } as any);

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/unauthorized');
  });
});
