import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * CSRF Protection Guard
 * Validates CSRF tokens for state-changing operations
 * 
 * Note: For full CSRF protection, you should:
 * 1. Generate CSRF token on GET requests
 * 2. Include token in forms/requests
 * 3. Validate token on POST/PUT/PATCH/DELETE requests
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Only protect state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    // Skip CSRF check in development if configured
    if (this.configService.get('NODE_ENV') === 'development' && 
        this.configService.get('SKIP_CSRF') === 'true') {
      return true;
    }

    // Get CSRF token from header or body
    const csrfToken = 
      request.headers['x-csrf-token'] || 
      request.body?.csrfToken ||
      request.query?.csrfToken;

    // Get expected token from session (you'll need to implement session storage)
    const sessionToken = (request as any).session?.csrfToken;

    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    return true;
  }
}
