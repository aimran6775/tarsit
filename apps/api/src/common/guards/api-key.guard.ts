import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService } from '../services/api-key.service';

/**
 * API Key Guard
 * Validates API keys for programmatic access
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Get API key from header
    const apiKey = 
      request.headers['x-api-key'] as string ||
      request.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    const validation = await this.apiKeyService.validateApiKey(apiKey);

    if (!validation.valid) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Attach user info to request
    (request as any).apiKey = {
      keyId: validation.keyId,
      userId: validation.userId,
    };

    return true;
  }
}
