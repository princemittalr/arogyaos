import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from './rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows requests within limit for standard role', () => {
    const uid = 'user1';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(uid, 'citizen')).toBe(true);
    }
    // 6th request should fail
    expect(checkRateLimit(uid, 'citizen')).toBe(false);
  });

  it('allows more requests for admin roles', () => {
    const uid = 'admin1';
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(uid, 'super_admin')).toBe(true);
    }
    // 21st request should fail
    expect(checkRateLimit(uid, 'super_admin')).toBe(false);
  });

  it('resets rate limit after 1 minute', () => {
    const uid = 'user2';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(uid, 'citizen')).toBe(true);
    }
    expect(checkRateLimit(uid, 'citizen')).toBe(false);

    // Advance time by 61 seconds
    vi.advanceTimersByTime(61000);

    // Should be allowed again
    expect(checkRateLimit(uid, 'citizen')).toBe(true);
  });
});
