type LogLevel = 'info' | 'warn' | 'error';

interface LogOptions {
  tag?: string;
  data?: unknown;
}

// Fields that must never appear in log output
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'idToken',
  'sessionCookie',
  'privateKey',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'credentials',
]);

/**
 * Recursively scrub known-sensitive keys from an object before logging.
 * Primitive values are passed through unchanged.
 */
function redactSensitive(value: unknown, depth = 0): unknown {
  if (depth > 5 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redactSensitive(v, depth + 1));

  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      result[k] = '[REDACTED]';
    } else {
      result[k] = redactSensitive(v, depth + 1);
    }
  }
  return result;
}

export const logger = {
  info(message: string, options?: LogOptions) {
    this._log('info', message, options);
  },

  warn(message: string, options?: LogOptions) {
    this._log('warn', message, options);
  },

  error(message: string, options?: LogOptions) {
    this._log('error', message, options);
  },

  apiFailure(endpoint: string, status: number, errorMsg: string, data?: unknown) {
    this._log('error', `API Failure on ${endpoint} | Status: ${status} | Error: ${errorMsg}`, {
      tag: 'api',
      data,
    });
  },

  aiFailure(prompt: string, errorMsg: string, data?: unknown) {
    this._log('error', `AI Service Failure | Prompt: "${prompt}" | Error: ${errorMsg}`, {
      tag: 'ai',
      data,
    });
  },

  authFailure(email: string, errorMsg: string, data?: unknown) {
    this._log('warn', `Authentication Failure for ${email} | Error: ${errorMsg}`, {
      tag: 'auth',
      data,
    });
  },

  performance(metric: string, durationMs: number, data?: unknown) {
    this._log('info', `Performance Metric: ${metric} took ${durationMs.toFixed(2)}ms`, {
      tag: 'performance',
      data: { ...(typeof data === 'object' && data !== null ? data : {}), durationMs },
    });
  },

  _log(level: LogLevel, message: string, options?: LogOptions) {
    const timestamp = new Date().toISOString();
    const tagStr = options?.tag ? `[${options.tag.toUpperCase()}]` : '';
    const safeData = options?.data ? redactSensitive(options.data) : undefined;
    const dataStr = safeData !== undefined ? `| Data: ${JSON.stringify(safeData)}` : '';
    const formatted = `${timestamp} [${level.toUpperCase()}]${tagStr}: ${message} ${dataStr}`;

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  },
};

export default logger;
