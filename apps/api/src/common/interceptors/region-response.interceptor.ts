import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor that adds region/language metadata to API responses
 * Adds headers and wraps responses with locale info when needed
 */
@Injectable()
export class RegionResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Get region info from request (set by RegionMiddleware)
    const regionCode = request.regionCode;
    const languageCode = request.languageCode || 'en';
    const currencyCode = request.currencyCode;

    // Set response headers with locale info
    response.setHeader('X-Region-Code', regionCode || 'GLOBAL');
    response.setHeader('X-Language-Code', languageCode);
    if (currencyCode) {
      response.setHeader('X-Currency-Code', currencyCode);
    }

    // Add Content-Language header for proper browser handling
    response.setHeader('Content-Language', languageCode);

    return next.handle().pipe(
      map((data) => {
        // For paginated/list responses, add locale metadata
        if (data && typeof data === 'object') {
          // Check if it's a paginated response
          if ('total' in data || 'businesses' in data || 'items' in data) {
            return {
              ...data,
              _meta: {
                locale: {
                  region: regionCode || null,
                  language: languageCode,
                  currency: currencyCode || null,
                },
              },
            };
          }
        }
        return data;
      }),
    );
  }
}
