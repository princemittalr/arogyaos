import { describe, it, expect } from 'vitest';
import { isValidRole, ALL_ROLES } from './roles';

describe('Roles Helper Functions Unit Tests', () => {
  it('should identify valid roles correctly', () => {
    expect(isValidRole('doctor')).toBe(true);
    expect(isValidRole('citizen')).toBe(true);
    expect(isValidRole('district_admin')).toBe(true);
  });

  it('should reject invalid roles', () => {
    expect(isValidRole('guest')).toBe(false);
    expect(isValidRole('admin')).toBe(false); // only hospital_admin/district_admin/super_admin are valid
    expect(isValidRole('')).toBe(false);
  });

  it('should have correct list of ALL_ROLES', () => {
    expect(ALL_ROLES).toContain('citizen');
    expect(ALL_ROLES).toContain('doctor');
    expect(ALL_ROLES).toContain('hospital_admin');
    expect(ALL_ROLES).toContain('district_admin');
  });
});
