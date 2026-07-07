import { expect, test, describe } from 'vitest';
import { PharmacyRetry } from './core/PharmacyRetry';
import { PharmacyCache } from './core/PharmacyCache';

describe('Pharmacy Module Tests', () => {
  test('PharmacyCache sets and gets items correctly', () => {
    PharmacyCache.set('test-key', { foo: 'bar' }, 1000);
    const item = PharmacyCache.get<{foo: string}>('test-key');
    expect(item).not.toBeNull();
    expect(item?.foo).toBe('bar');
  });

  test('PharmacyCache respects TTL', async () => {
    PharmacyCache.set('test-key-ttl', { foo: 'bar' }, -100);
    const item = PharmacyCache.get('test-key-ttl');
    expect(item).toBeNull();
  });

  test('PharmacyCache invalidates correctly', () => {
    PharmacyCache.set('inv-1', { a: 1 }, 1000);
    PharmacyCache.set('inv-2', { a: 2 }, 1000);
    PharmacyCache.invalidate('inv-');
    expect(PharmacyCache.get('inv-1')).toBeNull();
  });

  test('PharmacyRetry succeeds on first try', async () => {
    const fn = async () => 'success';
    const result = await PharmacyRetry.execute(fn);
    expect(result).toBe('success');
  });

  test('PharmacyRetry throws after max attempts', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      throw new Error('fail');
    };
    await expect(PharmacyRetry.execute(fn, { aggressive: false })).rejects.toThrow('fail');
    expect(attempts).toBe(3);
  });
});
