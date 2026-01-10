import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { LoggerService } from '../services/logger.service';
import { SpamDetectionService } from '../services/spam-detection.service';

@Injectable()
export class SpamCheckGuard implements CanActivate {
  constructor(
    private spamDetection: SpamDetectionService,
    private logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip = request.ip || request.headers['x-forwarded-for'];
    const body = request.body;

    // Determine content type based on route
    const path = request.route?.path || '';
    let contentType: 'review' | 'message' | 'business' | 'profile' = 'message';
    
    if (path.includes('review')) {
      contentType = 'review';
    } else if (path.includes('business')) {
      contentType = 'business';
    } else if (path.includes('profile') || path.includes('user')) {
      contentType = 'profile';
    }

    // Extract content from body
    const content = this.extractContent(body, contentType);
    
    if (!content) {
      return true; // No content to check
    }

    const result = await this.spamDetection.checkContent({
      userId: user?.id,
      ip,
      content,
      type: contentType,
    });

    if (result.blocked) {
      this.logger.logSecurityEvent('spam_blocked', {
        userId: user?.id,
        ip,
        path,
        reason: 'user_blocked',
      });
      throw new ForbiddenException('Your account has been temporarily restricted. Please contact support.');
    }

    if (result.isSpam) {
      this.logger.logSecurityEvent('spam_rejected', {
        userId: user?.id,
        ip,
        path,
        score: result.score,
        flags: result.flags,
      });
      throw new ForbiddenException('Your content was flagged as spam. Please revise and try again.');
    }

    // Attach spam check result to request for potential use
    request.spamCheck = result;

    return true;
  }

  private extractContent(body: any, type: string): string | null {
    if (!body) return null;

    switch (type) {
      case 'review':
        return body.comment || body.content || body.text || null;
      case 'message':
        return body.content || body.message || body.text || null;
      case 'business':
        return [body.name, body.description].filter(Boolean).join(' ');
      case 'profile':
        return [body.name, body.bio, body.about].filter(Boolean).join(' ');
      default:
        return body.content || body.text || body.message || null;
    }
  }
}
