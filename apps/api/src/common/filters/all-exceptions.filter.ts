import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext('ExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HttpException (includes all NestJS built-in exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string | string[]) || message;
        error = (resp.error as string) || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Generate request ID for tracking
    const requestId =
      (request.headers['x-request-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    // Log the error
    if (status >= 500) {
      // Server errors - log full details and report to Sentry
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : undefined,
      );

      // Report to Sentry
      Sentry.withScope((scope) => {
        scope.setTag('status_code', status.toString());
        scope.setTag('request_id', requestId);
        scope.setExtra('request', {
          method: request.method,
          url: request.url,
          headers: this.sanitizeHeaders(request.headers),
          body: this.sanitizeBody(request.body),
          query: request.query,
          params: request.params,
        });

        if (request.user) {
          const user = request.user as { userId?: string; email?: string };
          scope.setUser({
            id: user.userId,
            email: user.email,
          });
        }

        if (exception instanceof Error) {
          Sentry.captureException(exception);
        } else {
          Sentry.captureMessage(`Non-error exception: ${JSON.stringify(exception)}`, 'error');
        }
      });
    } else if (status >= 400) {
      // Client errors - log warning level
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
      );
    }

    // Send response
    response.status(status).json(errorResponse);
  }

  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    return sanitized;
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...(body as Record<string, unknown>) };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'apiKey', 'secret'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }
}
