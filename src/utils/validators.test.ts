import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  loginFormSchema,
  registerFormSchema,
} from './validators';

describe('Validation Schemas Unit Tests', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      const valid = emailSchema.safeParse('doctor@arogya.in');
      expect(valid.success).toBe(true);
    });

    it('should reject malformed email addresses', () => {
      const invalid = emailSchema.safeParse('not-an-email');
      expect(invalid.success).toBe(false);
    });

    it('should reject empty emails', () => {
      const invalid = emailSchema.safeParse('');
      expect(invalid.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should accept passwords with 6 or more characters', () => {
      const valid = passwordSchema.safeParse('123456');
      expect(valid.success).toBe(true);
    });

    it('should reject passwords with less than 6 characters', () => {
      const invalid = passwordSchema.safeParse('12345');
      expect(invalid.success).toBe(false);
    });
  });

  describe('loginFormSchema', () => {
    it('should validate correct login payload', () => {
      const valid = loginFormSchema.safeParse({
        email: 'test@arogya.in',
        password: 'securePassword123',
      });
      expect(valid.success).toBe(true);
    });

    it('should reject invalid login payloads', () => {
      const invalid = loginFormSchema.safeParse({
        email: 'invalid',
        password: '123',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('registerFormSchema', () => {
    it('should validate matching password fields', () => {
      const valid = registerFormSchema.safeParse({
        fullName: 'Dr. Jane Smith',
        email: 'janesmith@arogya.in',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'doctor',
      });
      expect(valid.success).toBe(true);
    });

    it('should reject registration if password and confirmPassword do not match', () => {
      const invalid = registerFormSchema.safeParse({
        fullName: 'Dr. Jane Smith',
        email: 'janesmith@arogya.in',
        password: 'password123',
        confirmPassword: 'differentPassword',
        role: 'doctor',
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        const issue = invalid.error.issues[0];
        expect(issue.message).toBe("Passwords don't match");
        expect(issue.path).toContain('confirmPassword');
      }
    });
  });
});
