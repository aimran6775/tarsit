import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  limit: number;
  ttl: number; // Time window in milliseconds
  skipIf?: (context: any) => boolean; // Optional condition to skip rate limiting
}

/**
 * Custom rate limit decorator for more granular control
 */
export const CustomRateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
