import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY, CACHE_TTL_KEY } from '../decorators/cache.decorator';
import { Request } from 'express';

/**
 * Cache Interceptor
 * Automatically caches responses for methods decorated with @Cache()
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Check if caching is enabled for this method
    const isCached = this.reflector.getAllAndOverride<boolean>(CACHE_KEY, [
      handler,
      controller,
    ]);

    if (!isCached) {
      return next.handle();
    }

    // Get TTL from decorator or use default
    const ttl = this.reflector.getAllAndOverride<number>(CACHE_TTL_KEY, [
      handler,
      controller,
    ]) || 300;

    // Generate cache key from request
    const cacheKey = this.generateCacheKey(request);

    // Try to get from cache
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // If not cached, execute handler and cache result
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(cacheKey, response, ttl * 1000);
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    const { method, url, query, params, body } = request;
    
    // Create a unique key based on method, URL, and relevant params
    const keyParts = [
      method,
      url,
      JSON.stringify(query),
      JSON.stringify(params),
      // Only include non-sensitive body data
      body ? JSON.stringify(this.sanitizeBody(body)) : '',
    ];

    return `cache:${Buffer.from(keyParts.join(':')).toString('base64')}`;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized: any = {};
    const sensitiveFields = ['password', 'token', 'refreshToken'];

    for (const key in body) {
      if (!sensitiveFields.includes(key)) {
        sanitized[key] = body[key];
      }
    }

    return sanitized;
  }
}
