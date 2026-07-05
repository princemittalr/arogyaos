import { logger } from './logger';

export const monitoring = {
  trackLatency: async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      // Log latency if it exceeds 1000ms
      if (duration > 1000) {
        logger.warn(`High Latency Detected: ${operationName} took ${duration.toFixed(2)}ms`, {
          tag: 'performance',
          data: { durationMs: duration },
        });
      } else {
        logger.info(`${operationName} completed in ${duration.toFixed(2)}ms`, {
          tag: 'performance',
        });
      }
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`Operation Failed: ${operationName} failed after ${duration.toFixed(2)}ms`, {
        tag: 'performance',
        data: { error },
      });
      throw error;
    }
  },
};
export default monitoring;
