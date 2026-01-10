import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type TarsPersona = 'guest' | 'customer' | 'business';
export type TarsEventType =
  | 'chat_started'
  | 'chat_completed'
  | 'action_performed'
  | 'action_denied'
  | 'quick_response_used'
  | 'booking_initiated'
  | 'search_performed'
  | 'error_occurred'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'persona_switched';

export interface TarsAnalyticsEvent {
  persona: TarsPersona;
  eventType: TarsEventType;
  context?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  businessId?: string;
  sessionId?: string;
}

export interface PersonaMetrics {
  persona: TarsPersona;
  totalChats: number;
  avgMessagesPerChat: number;
  actionsPerformed: number;
  actionsDenied: number;
  conversionRate: number;
  avgResponseTime: number;
}

/**
 * TARS Analytics Service
 *
 * Tracks persona interactions and provides metrics.
 * Note: Requires TarsAnalytics model in Prisma schema.
 * Run `prisma migrate dev` to create the table after schema update.
 */
@Injectable()
export class TarsAnalyticsService {
  private readonly logger = new Logger(TarsAnalyticsService.name);
  private analyticsEnabled = false;

  constructor(private prisma: PrismaService) {
    // Check if analytics table exists
    this.checkAnalyticsEnabled();
  }

  private async checkAnalyticsEnabled(): Promise<void> {
    try {
      // Try to query the table to see if it exists
      await (this.prisma as any).tarsAnalytics?.count();
      this.analyticsEnabled = true;
      this.logger.log('TARS Analytics enabled');
    } catch {
      this.analyticsEnabled = false;
      this.logger.warn('TARS Analytics table not found. Run prisma migrate to enable analytics.');
    }
  }

  /**
   * Track a TARS analytics event
   */
  async trackEvent(event: TarsAnalyticsEvent): Promise<void> {
    if (!this.analyticsEnabled) {
      this.logger.debug(`Analytics disabled, skipping event: ${event.eventType}`);
      return;
    }

    try {
      await (this.prisma as any).tarsAnalytics.create({
        data: {
          persona: event.persona,
          eventType: event.eventType,
          context: event.context,
          metadata: event.metadata,
          userId: event.userId,
          businessId: event.businessId,
          sessionId: event.sessionId,
        },
      });

      this.logger.debug(`Tracked TARS event: ${event.eventType} for persona ${event.persona}`);
    } catch (error) {
      // Don't fail on analytics errors, just log
      this.logger.warn(`Failed to track TARS analytics: ${error}`);
    }
  }

  /**
   * Get metrics for a specific persona
   */
  async getPersonaMetrics(
    persona: TarsPersona,
    dateRange?: { start: Date; end: Date }
  ): Promise<PersonaMetrics> {
    if (!this.analyticsEnabled) {
      return this.getEmptyMetrics(persona);
    }

    const prismaAny = this.prisma as any;
    const where = {
      persona,
      ...(dateRange && {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    };

    try {
      const [totalChats, actionsPerformed, actionsDenied] = await Promise.all([
        prismaAny.tarsAnalytics.count({
          where: { ...where, eventType: 'chat_started' },
        }),
        prismaAny.tarsAnalytics.count({
          where: { ...where, eventType: 'action_performed' },
        }),
        prismaAny.tarsAnalytics.count({
          where: { ...where, eventType: 'action_denied' },
        }),
      ]);

      // Calculate conversion rate (actions performed vs. total chats)
      const conversionRate = totalChats > 0 ? (actionsPerformed / totalChats) * 100 : 0;

      return {
        persona,
        totalChats,
        avgMessagesPerChat: 0, // Would need message tracking
        actionsPerformed,
        actionsDenied,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgResponseTime: 0, // Would need timing data
      };
    } catch (error) {
      this.logger.error(`Error getting persona metrics: ${error}`);
      return this.getEmptyMetrics(persona);
    }
  }

  /**
   * Get aggregate metrics across all personas
   */
  async getAggregateMetrics(dateRange?: {
    start: Date;
    end: Date;
  }): Promise<{ byPersona: PersonaMetrics[]; total: Record<string, number> }> {
    const personas: TarsPersona[] = ['guest', 'customer', 'business'];

    const byPersona = await Promise.all(
      personas.map((persona) => this.getPersonaMetrics(persona, dateRange))
    );

    const total = {
      totalChats: byPersona.reduce((sum, m) => sum + m.totalChats, 0),
      actionsPerformed: byPersona.reduce((sum, m) => sum + m.actionsPerformed, 0),
      actionsDenied: byPersona.reduce((sum, m) => sum + m.actionsDenied, 0),
    };

    return { byPersona, total };
  }

  /**
   * Get popular actions by persona
   */
  async getPopularActions(
    persona: TarsPersona,
    limit: number = 10
  ): Promise<{ action: string; count: number }[]> {
    if (!this.analyticsEnabled) {
      return [];
    }

    try {
      const events = await (this.prisma as any).tarsAnalytics.groupBy({
        by: ['context'],
        where: {
          persona,
          eventType: 'action_performed',
          context: { not: null },
        },
        _count: { context: true },
        orderBy: { _count: { context: 'desc' } },
        take: limit,
      });

      return events.map((e: any) => ({
        action: e.context || 'unknown',
        count: e._count.context,
      }));
    } catch (error) {
      this.logger.error(`Error getting popular actions: ${error}`);
      return [];
    }
  }

  /**
   * Get denied actions by persona (for improving capabilities)
   */
  async getDeniedActions(
    persona: TarsPersona,
    limit: number = 10
  ): Promise<{ action: string; count: number }[]> {
    if (!this.analyticsEnabled) {
      return [];
    }

    try {
      const events = await (this.prisma as any).tarsAnalytics.groupBy({
        by: ['context'],
        where: {
          persona,
          eventType: 'action_denied',
          context: { not: null },
        },
        _count: { context: true },
        orderBy: { _count: { context: 'desc' } },
        take: limit,
      });

      return events.map((e: any) => ({
        action: e.context || 'unknown',
        count: e._count.context,
      }));
    } catch (error) {
      this.logger.error(`Error getting denied actions: ${error}`);
      return [];
    }
  }

  private getEmptyMetrics(persona: TarsPersona): PersonaMetrics {
    return {
      persona,
      totalChats: 0,
      avgMessagesPerChat: 0,
      actionsPerformed: 0,
      actionsDenied: 0,
      conversionRate: 0,
      avgResponseTime: 0,
    };
  }
}
