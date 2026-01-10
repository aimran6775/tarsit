import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';

// Custom format for development (colored, readable)
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const ctx = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} ${level} ${ctx} ${message} ${metaStr}`;
  }),
);

// Custom format for production (JSON, structured)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Create the winston logger instance
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'tarsit-api' },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

// Add file transport in production
if (process.env.NODE_ENV === 'production' && process.env.LOG_FILE_PATH) {
  winstonLogger.add(
    new winston.transports.File({
      filename: process.env.LOG_FILE_PATH,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  );
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    winstonLogger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    winstonLogger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  warn(message: string, context?: string) {
    winstonLogger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    winstonLogger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    winstonLogger.verbose(message, { context: context || this.context });
  }

  // Extended methods for structured logging
  logWithMeta(level: string, message: string, meta: Record<string, unknown>) {
    winstonLogger.log(level, message, { context: this.context, ...meta });
  }

  // Log HTTP request
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    winstonLogger.info('HTTP Request', {
      context: 'HTTP',
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
    });
  }

  // Log database query
  logQuery(query: string, duration: number, params?: unknown[]) {
    winstonLogger.debug('Database Query', {
      context: 'Database',
      query: query.substring(0, 200), // Truncate long queries
      duration: `${duration}ms`,
      params: params?.length ? params : undefined,
    });
  }

  // Log business event
  logBusinessEvent(event: string, businessId: string, data?: Record<string, unknown>) {
    winstonLogger.info('Business Event', {
      context: 'Business',
      event,
      businessId,
      ...data,
    });
  }

  // Log user action
  logUserAction(action: string, userId: string, data?: Record<string, unknown>) {
    winstonLogger.info('User Action', {
      context: 'User',
      action,
      userId,
      ...data,
    });
  }

  // Log security event
  logSecurityEvent(event: string, data?: Record<string, unknown>) {
    winstonLogger.warn('Security Event', {
      context: 'Security',
      event,
      ...data,
    });
  }

  // Log performance metric
  logPerformance(operation: string, duration: number, meta?: Record<string, unknown>) {
    winstonLogger.info('Performance', {
      context: 'Performance',
      operation,
      duration: `${duration}ms`,
      ...meta,
    });
  }
}

// Export singleton for use outside of NestJS DI
export const logger = new LoggerService();
