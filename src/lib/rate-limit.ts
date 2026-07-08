import { UserRole } from '@/config/roles';

// Simple in-memory rate limiter for Edge/Node
// Key: uid, Value: { count: number, resetAt: number }
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(uid: string, role: UserRole): boolean {
  const now = Date.now();
  let record = store.get(uid);

  // Clean up expired
  if (record && now > record.resetAt) {
    store.delete(uid);
    record = undefined;
  }

  // Determine limit based on role
  let limit = 5; // default 5 per minute
  if (role === 'super_admin' || role === 'district_admin') {
    limit = 20; // 20 per minute
  } else if (role === 'hospital_admin' || role === 'doctor') {
    limit = 10; // 10 per minute
  }

  if (!record) {
    store.set(uid, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  store.set(uid, record);
  return true;
}
