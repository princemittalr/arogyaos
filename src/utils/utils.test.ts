import { describe, it, expect } from 'vitest';
import { cn } from './cn';
import { dateUtils } from './date';
import { helpers } from './helpers';

describe('Utility Functions Unit Tests', () => {
  describe('cn utility', () => {
    it('should combine basic class strings', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should ignore falsy values', () => {
      expect(cn('class1', null, undefined, false, 'class2')).toBe('class1 class2');
    });

    it('should correctly merge tailwind classes', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('helpers utility', () => {
    describe('getInitials', () => {
      it('should return initials for single name', () => {
        expect(helpers.getInitials('Rahul')).toBe('R');
      });

      it('should return initials for full name', () => {
        expect(helpers.getInitials('Rahul Sharma')).toBe('RS');
        expect(helpers.getInitials('Dr. Jane Doe Smith')).toBe('DS');
      });

      it('should handle extra whitespace', () => {
        expect(helpers.getInitials('  John    Doe  ')).toBe('JD');
      });

      it('should return empty string for empty input', () => {
        expect(helpers.getInitials('')).toBe('');
      });
    });

    describe('truncateString', () => {
      it('should not truncate if string is shorter than max length', () => {
        expect(helpers.truncateString('hello', 10)).toBe('hello');
      });

      it('should truncate and add ellipsis if string exceeds max length', () => {
        expect(helpers.truncateString('hello world', 8)).toBe('hello...');
      });
    });

    describe('safeJsonParse', () => {
      it('should parse valid JSON correctly', () => {
        expect(helpers.safeJsonParse('{"ok": true}', { ok: false })).toEqual({ ok: true });
      });

      it('should return fallback value for invalid JSON', () => {
        expect(helpers.safeJsonParse('invalid-json', { fallback: true })).toEqual({ fallback: true });
      });
    });
  });

  describe('dateUtils utility', () => {
    it('should format Date object correctly', () => {
      const d = new Date(2026, 6, 6); // 6th July 2026
      expect(dateUtils.formatDate(d, 'yyyy-MM-dd')).toBe('2026-07-06');
    });

    it('should format ISO string correctly', () => {
      expect(dateUtils.formatDate('2026-07-06T12:00:00Z', 'yyyy-MM-dd')).toBe('2026-07-06');
    });

    it('should format time correctly', () => {
      const d = new Date(2026, 6, 6, 14, 30, 0); // 14:30
      expect(dateUtils.formatTime(d, 'HH:mm')).toBe('14:30');
    });
  });
});
