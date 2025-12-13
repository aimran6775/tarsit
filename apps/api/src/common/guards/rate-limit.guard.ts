import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * Enhanced Rate Limiting Guard
 * Provides different rate limits based on endpoint and user authentication status
 */
@Injectable()
export class EnhancedRateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // Use IP address as base tracker
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // For authenticated users, include user ID for more accurate tracking
    const userId = (req as any).user?.id;
    if (userId) {
      return `${ip}:${userId}`;
    }
    
    return ip;
  }

  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    
    // Set rate limit headers
    const ttl = await this.getThrottlerOptions(context);
    response.setHeader('X-RateLimit-Limit', ttl.limit);
    response.setHeader('X-RateLimit-Remaining', '0');
    response.setHeader('Retry-After', Math.ceil(ttl.ttl / 1000));
    
    throw new ThrottlerException('Too many requests. Please try again later.');
  }
}
