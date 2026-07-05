type LogLevel = 'info' | 'warn' | 'error';

interface LogOptions {
  tag?: string;
  data?: unknown;
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

  _log(level: LogLevel, message: string, options?: LogOptions) {
    const timestamp = new Date().toISOString();
    const tagStr = options?.tag ? `[${options.tag.toUpperCase()}]` : '';
    const dataStr = options?.data ? `| Data: ${JSON.stringify(options.data)}` : '';
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
