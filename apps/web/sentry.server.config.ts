// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out common non-actionable errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore specific errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Ignore expected errors
      if (
        message.includes('econnrefused') ||
        message.includes('socket hang up') ||
        message.includes('enotfound')
      ) {
        return null;
      }
    }

    return event;
  },

  // Set environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
