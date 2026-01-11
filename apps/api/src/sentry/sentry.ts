import * as Sentry from '@sentry/node';
import { LoggerService } from '../common/services/logger.service';

const logger = new LoggerService();
logger.setContext('Sentry');

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    enabled: process.env.NODE_ENV === 'production',

    // Performance monitoring
    tracesSampleRate: 0.1,

    // Release tracking
    release: process.env.SENTRY_RELEASE,

    // Server name for identification
    serverName: process.env.SERVER_NAME || 'tarsit-api',

    // Integrations
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.prismaIntegration(),
    ],

    // Filter sensitive data
    beforeSend(event, _hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }

      // Remove sensitive data from request body
      if (event.request?.data) {
        const data =
          typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;

        if (data.password) data.password = '[REDACTED]';
        if (data.token) data.token = '[REDACTED]';
        if (data.apiKey) data.apiKey = '[REDACTED]';

        event.request.data = JSON.stringify(data);
      }

      return event;
    },

    // Filter out common non-actionable errors
    ignoreErrors: [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'socket hang up',
      'UnauthorizedException',
      'NotFoundException',
    ],
  });

  logger.log('Sentry initialized successfully');
}

// Helper to capture exceptions with context
export function captureException(
  error: Error,
  context?: {
    user?: { id: string; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
) {
  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser({ id: context.user.id, email: context.user.email });
    }
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

// Helper to capture messages
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
) {
  Sentry.captureMessage(message, level);
}

// Helper to set user context
export function setUser(user: { id: string; email?: string; role?: string }) {
  Sentry.setUser(user);
}

// Helper to add breadcrumb
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
  });
}

export { Sentry };
