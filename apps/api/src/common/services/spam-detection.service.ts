import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from './logger.service';

interface SpamCheckResult {
  isSpam: boolean;
  score: number;
  flags: string[];
  blocked: boolean;
}

interface ContentCheckOptions {
  userId?: string;
  ip?: string;
  email?: string;
  content: string;
  type: 'review' | 'message' | 'business' | 'profile';
}

@Injectable()
export class SpamDetectionService {
  // Common spam patterns
  private readonly spamPatterns = [
    /\b(?:viagra|cialis|casino|lottery|winner|prize|free money)\b/i,
    /\b(?:click here|act now|limited time|urgent|hurry)\b/i,
    /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq|xyz)\b/i, // Suspicious TLDs
    /(.)\1{5,}/, // Repeated characters (aaaaaaaa)
    /\$\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:per|\/)\s*(?:hour|day|week)/i, // Money offers
  ];

  // Profanity and inappropriate content (basic list)
  private readonly inappropriatePatterns = [
    /\b(?:hate|kill|murder|terrorist)\b/i,
  ];

  // Link patterns
  private readonly linkPattern = /https?:\/\/[^\s]+/gi;

  // Rate limiting thresholds
  private readonly rateThresholds = {
    review: { count: 5, windowMinutes: 60 }, // 5 reviews per hour
    message: { count: 20, windowMinutes: 10 }, // 20 messages per 10 minutes
    business: { count: 3, windowMinutes: 1440 }, // 3 businesses per day
    profile: { count: 10, windowMinutes: 60 }, // 10 profile updates per hour
  };

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async checkContent(options: ContentCheckOptions): Promise<SpamCheckResult> {
    const { userId, ip, content, type } = options;
    const flags: string[] = [];
    let score = 0;

    // Check if user/IP is already blocked
    const blockStatus = await this.checkBlockStatus(userId, ip);
    if (blockStatus.blocked) {
      return {
        isSpam: true,
        score: 100,
        flags: ['blocked_user'],
        blocked: true,
      };
    }

    // Check rate limiting
    const rateViolation = await this.checkRateLimit(userId, ip, type);
    if (rateViolation) {
      flags.push('rate_limit_exceeded');
      score += 30;
    }

    // Check for spam patterns
    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        flags.push('spam_pattern');
        score += 20;
        break;
      }
    }

    // Check for inappropriate content
    for (const pattern of this.inappropriatePatterns) {
      if (pattern.test(content)) {
        flags.push('inappropriate_content');
        score += 25;
        break;
      }
    }

    // Check for excessive links
    const links = content.match(this.linkPattern) || [];
    if (links.length > 3) {
      flags.push('excessive_links');
      score += 15;
    }

    // Check content length
    if (content.length < 10 && type === 'review') {
      flags.push('too_short');
      score += 10;
    }

    // Check for repeated content
    const isRepeated = await this.checkRepeatedContent(userId, content);
    if (isRepeated) {
      flags.push('repeated_content');
      score += 25;
    }

    // Check for ALL CAPS
    const capsRatio = this.getCapsRatio(content);
    if (capsRatio > 0.7 && content.length > 20) {
      flags.push('excessive_caps');
      score += 10;
    }

    // Update spam score for user/IP
    if (userId || ip) {
      await this.updateSpamScore(userId, ip, score, flags);
    }

    const isSpam = score >= 50;

    if (isSpam) {
      this.logger.logSecurityEvent('spam_detected', {
        userId,
        ip,
        type,
        score,
        flags,
        contentLength: content.length,
      });
    }

    return {
      isSpam,
      score,
      flags,
      blocked: false,
    };
  }

  async checkBlockStatus(userId?: string, ip?: string): Promise<{ blocked: boolean; reason?: string }> {
    if (!userId && !ip) {
      return { blocked: false };
    }

    // Check by user ID
    if (userId) {
      const userScore = await this.prisma.spamScore.findUnique({
        where: {
          entityType_entityId: {
            entityType: 'user',
            entityId: userId,
          },
        },
      });

      if (userScore) {
        if (userScore.permanentBan) {
          return { blocked: true, reason: 'permanent_ban' };
        }
        if (userScore.blockedUntil && userScore.blockedUntil > new Date()) {
          return { blocked: true, reason: 'temporary_block' };
        }
      }
    }

    // Check by IP
    if (ip) {
      const ipScore = await this.prisma.spamScore.findUnique({
        where: {
          entityType_entityId: {
            entityType: 'ip',
            entityId: ip,
          },
        },
      });

      if (ipScore) {
        if (ipScore.permanentBan) {
          return { blocked: true, reason: 'ip_permanent_ban' };
        }
        if (ipScore.blockedUntil && ipScore.blockedUntil > new Date()) {
          return { blocked: true, reason: 'ip_temporary_block' };
        }
      }
    }

    return { blocked: false };
  }

  private async checkRateLimit(
    userId: string | undefined,
    ip: string | undefined,
    type: ContentCheckOptions['type'],
  ): Promise<boolean> {
    const threshold = this.rateThresholds[type];
    const since = new Date(Date.now() - threshold.windowMinutes * 60 * 1000);

    const entityId = userId || ip;
    if (!entityId) return false;

    const score = await this.prisma.spamScore.findUnique({
      where: {
        entityType_entityId: {
          entityType: userId ? 'user' : 'ip',
          entityId,
        },
      },
    });

    if (score && score.lastActionAt > since) {
      return score.actionCount >= threshold.count;
    }

    return false;
  }

  private async checkRepeatedContent(
    userId: string | undefined,
    content: string,
  ): Promise<boolean> {
    if (!userId) return false;

    // Check recent reviews for similar content
    const recentReviews = await this.prisma.review.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { comment: true },
      take: 10,
    });

    // Simple similarity check
    for (const review of recentReviews) {
      if (review.comment && this.similarity(content, review.comment) > 0.8) {
        return true;
      }
    }

    return false;
  }

  private similarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;
    if (s1.length < 2 || s2.length < 2) return 0;

    // Simple Jaccard similarity with words
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private getCapsRatio(text: string): number {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0;

    const caps = letters.replace(/[^A-Z]/g, '');
    return caps.length / letters.length;
  }

  private async updateSpamScore(
    userId: string | undefined,
    ip: string | undefined,
    score: number,
    flags: string[],
  ) {
    const entities: { type: string; id: string }[] = [];
    if (userId) entities.push({ type: 'user', id: userId });
    if (ip) entities.push({ type: 'ip', id: ip });

    for (const entity of entities) {
      await this.prisma.spamScore.upsert({
        where: {
          entityType_entityId: {
            entityType: entity.type,
            entityId: entity.id,
          },
        },
        update: {
          score: { increment: score },
          flags: { push: flags },
          actionCount: { increment: 1 },
          lastActionAt: new Date(),
          // Auto-block if score exceeds threshold
          blockedUntil: score >= 50
            ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour block
            : undefined,
        },
        create: {
          entityType: entity.type,
          entityId: entity.id,
          score,
          flags,
          actionCount: 1,
          lastActionAt: new Date(),
        },
      });
    }
  }

  // Admin methods
  async blockUser(userId: string, permanent = false): Promise<void> {
    await this.prisma.spamScore.upsert({
      where: {
        entityType_entityId: {
          entityType: 'user',
          entityId: userId,
        },
      },
      update: {
        permanentBan: permanent,
        blockedUntil: permanent ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        entityType: 'user',
        entityId: userId,
        score: 100,
        flags: ['admin_blocked'],
        actionCount: 0,
        permanentBan: permanent,
        blockedUntil: permanent ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    this.logger.logSecurityEvent('user_blocked', { userId, permanent });
  }

  async unblockUser(userId: string): Promise<void> {
    await this.prisma.spamScore.update({
      where: {
        entityType_entityId: {
          entityType: 'user',
          entityId: userId,
        },
      },
      data: {
        permanentBan: false,
        blockedUntil: null,
        score: 0,
        flags: [],
      },
    });

    this.logger.logSecurityEvent('user_unblocked', { userId });
  }

  async getSpamStats() {
    const [blocked, highRisk, totalScores] = await Promise.all([
      this.prisma.spamScore.count({
        where: {
          OR: [
            { permanentBan: true },
            { blockedUntil: { gte: new Date() } },
          ],
        },
      }),
      this.prisma.spamScore.count({
        where: { score: { gte: 50 } },
      }),
      this.prisma.spamScore.count(),
    ]);

    return {
      blocked,
      highRisk,
      totalTracked: totalScores,
    };
  }
}
