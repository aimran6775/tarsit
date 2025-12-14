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
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    
    // For authenticated users, include user ID for more accurate tracking
    const userId = (req as any).user?.id;
    if (userId) {
      return `${ip}:${userId}`;
    }
    
    return ip;
  }

  protected async throwThrottlingException(_context: ExecutionContext): Promise<void> {
    throw new ThrottlerException('Too many requests. Please try again later.');
  }
}
