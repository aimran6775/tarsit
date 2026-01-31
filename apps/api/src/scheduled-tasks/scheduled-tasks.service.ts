/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SCHEDULED TASKS SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Handles all scheduled/cron tasks for the application.
 * - Weekly digest emails to business owners
 * - Appointment reminders
 * - Cleanup tasks
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { WeeklyDigestStats } from '../mail/templates';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Send weekly digest emails to all business owners
   * Runs every Monday at 9:00 AM UTC
   */
  @Cron('0 9 * * 1') // Every Monday at 9:00 AM
  async sendWeeklyDigests() {
    this.logger.log('Starting weekly digest email job...');

    try {
      // Get all businesses with their owners
      const businesses = await this.prisma.business.findMany({
        where: {
          isActive: true,
        },
        include: {
          owner: true,
        },
      });

      const weekEnd = new Date();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      let sentCount = 0;
      let errorCount = 0;

      for (const business of businesses) {
        try {
          // Get stats for this business
          const stats = await this.getBusinessWeeklyStats(
            business.id,
            weekStart,
            weekEnd,
          );

          // Get top review if any
          const topReview = await this.getTopReviewForWeek(
            business.id,
            weekStart,
            weekEnd,
          );

          // Send the digest
          const sent = await this.mailService.sendWeeklyDigest(
            business.owner.email,
            business.owner.firstName,
            business.name,
            weekStart,
            weekEnd,
            stats,
            topReview,
          );

          if (sent) {
            sentCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          this.logger.error(
            `Failed to send digest for business ${business.id}: ${error.message}`,
          );
          errorCount++;
        }
      }

      this.logger.log(
        `Weekly digest job complete: ${sentCount} sent, ${errorCount} errors`,
      );
    } catch (error) {
      this.logger.error(`Weekly digest job failed: ${error.message}`);
    }
  }

  /**
   * Send appointment reminders for tomorrow's appointments
   * Runs every day at 6:00 PM UTC
   */
  @Cron('0 18 * * *') // Every day at 6:00 PM
  async sendAppointmentReminders() {
    this.logger.log('Starting appointment reminder job...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Get all confirmed appointments for tomorrow
      const appointments = await this.prisma.appointment.findMany({
        where: {
          startTime: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          },
          status: 'CONFIRMED',
        },
        include: {
          customer: true,
          business: true,
          service: true,
        },
      });

      let sentCount = 0;

      for (const appointment of appointments) {
        try {
          await this.mailService.sendAppointmentReminder(
            appointment.customer.email,
            appointment.customer.firstName,
            appointment.business.name,
            appointment.business.address || 'Address not available',
            appointment.startTime,
            appointment.service?.name || 'Service',
          );
          sentCount++;
        } catch (error) {
          this.logger.error(
            `Failed to send reminder for appointment ${appointment.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(`Appointment reminder job complete: ${sentCount} sent`);
    } catch (error) {
      this.logger.error(`Appointment reminder job failed: ${error.message}`);
    }
  }

  /**
   * Clean up expired tokens (magic links, password resets, verification)
   * Runs every day at 3:00 AM UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredTokens() {
    this.logger.log('Starting token cleanup job...');

    try {
      const now = new Date();

      // Clear expired magic link tokens
      const magicLinkResult = await this.prisma.user.updateMany({
        where: {
          magicLinkTokenExpiry: {
            lt: now,
          },
          magicLinkToken: {
            not: null,
          },
        },
        data: {
          magicLinkToken: null,
          magicLinkTokenExpiry: null,
        },
      });

      // Clear expired reset tokens
      const resetResult = await this.prisma.user.updateMany({
        where: {
          resetTokenExpiry: {
            lt: now,
          },
          resetToken: {
            not: null,
          },
        },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      // Clear expired verification tokens
      const verificationResult = await this.prisma.user.updateMany({
        where: {
          verificationTokenExpiry: {
            lt: now,
          },
          verificationToken: {
            not: null,
          },
        },
        data: {
          verificationToken: null,
          verificationTokenExpiry: null,
        },
      });

      this.logger.log(
        `Token cleanup complete: ${magicLinkResult.count} magic links, ${resetResult.count} reset tokens, ${verificationResult.count} verification tokens cleared`,
      );
    } catch (error) {
      this.logger.error(`Token cleanup job failed: ${error.message}`);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async getBusinessWeeklyStats(
    businessId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<WeeklyDigestStats> {
    // Get appointment stats
    const [newAppointments, completedAppointments, cancelledAppointments] =
      await Promise.all([
        this.prisma.appointment.count({
          where: {
            businessId,
            createdAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        this.prisma.appointment.count({
          where: {
            businessId,
            status: 'COMPLETED',
            updatedAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        this.prisma.appointment.count({
          where: {
            businessId,
            status: 'CANCELLED',
            updatedAt: { gte: weekStart, lte: weekEnd },
          },
        }),
      ]);

    // Get review stats
    const reviews = await this.prisma.review.findMany({
      where: {
        businessId,
        createdAt: { gte: weekStart, lte: weekEnd },
      },
      select: { rating: true },
    });

    const newReviews = reviews.length;
    const averageRating =
      newReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / newReviews
        : 0;

    // Profile views and messages would need separate tracking tables
    // For now, return placeholder values
    const profileViews = 0; // Would need analytics tracking
    const newMessages = 0; // Would need messages table

    return {
      newAppointments,
      completedAppointments,
      cancelledAppointments,
      newReviews,
      averageRating,
      profileViews,
      newMessages,
    };
  }

  private async getTopReviewForWeek(
    businessId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<{ reviewerName: string; rating: number; text: string } | undefined> {
    const topReview = await this.prisma.review.findFirst({
      where: {
        businessId,
        createdAt: { gte: weekStart, lte: weekEnd },
        rating: { gte: 4 }, // Only include good reviews
        comment: { not: null },
      },
      orderBy: { rating: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!topReview || !topReview.comment) {
      return undefined;
    }

    return {
      reviewerName: `${topReview.user.firstName} ${topReview.user.lastName?.[0] || ''}.`,
      rating: topReview.rating,
      text:
        topReview.comment.length > 150
          ? topReview.comment.substring(0, 150) + '...'
          : topReview.comment,
    };
  }
}
