import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Security Interceptor
 * Adds security-related headers and sanitizes responses
 */
@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // Add security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Add request ID for tracking (useful for security audits)
    const requestId = request.headers['x-request-id'] || 
                     `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    response.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      map((data) => {
        // Sanitize sensitive data from responses
        if (data && typeof data === 'object') {
          return this.sanitizeResponse(data);
        }
        return data;
      }),
    );
  }

  private sanitizeResponse(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponse(item));
    }

    if (data && typeof data === 'object') {
      const sanitized = { ...data };
      
      // Remove sensitive fields
      const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'verificationToken', 'resetToken'];
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          delete sanitized[field];
        }
      });

      // Recursively sanitize nested objects
      for (const key in sanitized) {
        if (sanitized[key] && typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeResponse(sanitized[key]);
        }
      }

      return sanitized;
    }

    return data;
  }
}
