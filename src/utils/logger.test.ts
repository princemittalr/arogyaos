 
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('Logger Utility Unit Tests', () => {
  let logSpy: any;
  let warnSpy: any;
  let errorSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should redact sensitive keys in logged data', () => {
    logger.info('Test redaction', {
      data: {
        username: 'doctor1',
        password: 'superSecretPassword',
        token: 'xyz123',
        nested: {
          secret: 'highly-sensitive-key',
          okField: 'public-data',
        },
      },
    });

    expect(logSpy).toHaveBeenCalled();
    const loggedText = logSpy.mock.calls[0][0];
    expect(loggedText).toContain('doctor1');
    expect(loggedText).toContain('public-data');
    expect(loggedText).toContain('[REDACTED]');
    expect(loggedText).not.toContain('superSecretPassword');
    expect(loggedText).not.toContain('highly-sensitive-key');
  });

  it('should use warn log level for auth failures', () => {
    logger.authFailure('user@arogya.in', 'Invalid credentials');
    expect(warnSpy).toHaveBeenCalled();
    const loggedText = warnSpy.mock.calls[0][0];
    expect(loggedText).toContain('[AUTH]');
    expect(loggedText).toContain('Authentication Failure');
    expect(loggedText).toContain('user@arogya.in');
  });

  it('should use error log level for api failures', () => {
    logger.apiFailure('/api/users', 500, 'Database Timeout');
    expect(errorSpy).toHaveBeenCalled();
    const loggedText = errorSpy.mock.calls[0][0];
    expect(loggedText).toContain('[API]');
    expect(loggedText).toContain('API Failure on /api/users');
    expect(loggedText).toContain('Database Timeout');
  });

  it('should use error log level for AI failures', () => {
    logger.aiFailure('Show insulin stocks', 'Gemini API quota exceeded');
    expect(errorSpy).toHaveBeenCalled();
    const loggedText = errorSpy.mock.calls[0][0];
    expect(loggedText).toContain('[AI]');
    expect(loggedText).toContain('AI Service Failure');
    expect(loggedText).toContain('Gemini API quota exceeded');
  });

  it('should print info levels correctly', () => {
    logger.info('Hello world');
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0]).toContain('Hello world');
  });
});
