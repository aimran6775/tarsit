import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TarsPersona } from '../analytics/tars-analytics.service';

export interface ProactiveMessage {
  message: string;
  action?: {
    label: string;
    query: string;
  };
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}

interface UserContext {
  userId?: string;
  businessId?: string;
  recentActivity?: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
}

@Injectable()
export class TarsProactiveService {
  private readonly logger = new Logger(TarsProactiveService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get proactive messages for the current persona and context
   */
  async getProactiveMessages(
    persona: TarsPersona,
    context: UserContext
  ): Promise<ProactiveMessage[]> {
    const messages: ProactiveMessage[] = [];

    switch (persona) {
      case 'guest':
        messages.push(...this.getGuestProactiveMessages(context));
        break;
      case 'customer':
        messages.push(...(await this.getCustomerProactiveMessages(context)));
        break;
      case 'business':
        messages.push(...(await this.getBusinessProactiveMessages(context)));
        break;
    }

    // Sort by priority and return top 3
    return messages
      .sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority))
      .slice(0, 3);
  }

  /**
   * Guest proactive messages - focused on discovery and signup
   */
  private getGuestProactiveMessages(context: UserContext): ProactiveMessage[] {
    const messages: ProactiveMessage[] = [];

    // Time-based recommendations
    if (context.timeOfDay === 'morning') {
      messages.push({
        message: '☕ Looking for a great coffee spot to start your day?',
        action: { label: 'Find coffee near me', query: 'coffee shops nearby' },
        priority: 'medium',
      });
    } else if (context.timeOfDay === 'evening') {
      messages.push({
        message: '🍽️ Planning dinner? Let me help you find the perfect restaurant!',
        action: { label: 'Dinner recommendations', query: 'good dinner restaurants' },
        priority: 'medium',
      });
    }

    // Weekend vs weekday
    if (context.dayOfWeek === 0 || context.dayOfWeek === 6) {
      messages.push({
        message: '🌟 Weekend plans? Discover local experiences and activities!',
        action: { label: 'Weekend activities', query: 'things to do this weekend' },
        priority: 'medium',
      });
    }

    // Always include signup nudge
    messages.push({
      message: '🚀 Sign up free to book appointments and save your favorites!',
      action: { label: 'Why create an account?', query: 'what are the benefits of signing up' },
      priority: 'low',
    });

    return messages;
  }

  /**
   * Customer proactive messages - personalized based on history
   */
  private async getCustomerProactiveMessages(context: UserContext): Promise<ProactiveMessage[]> {
    const messages: ProactiveMessage[] = [];

    if (!context.userId) {
      return messages;
    }

    try {
      // Check for upcoming appointments
      const upcomingAppointment = await this.prisma.appointment.findFirst({
        where: {
          userId: context.userId,
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 48 * 60 * 60 * 1000), // Next 48 hours
          },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          business: { select: { name: true } },
          service: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
      });

      if (upcomingAppointment) {
        const date = upcomingAppointment.date;
        const isToday = new Date().toDateString() === date.toDateString();

        messages.push({
          message: isToday
            ? `📅 Your appointment at ${upcomingAppointment.business.name} is today!`
            : `📅 Reminder: You have an appointment at ${upcomingAppointment.business.name} coming up!`,
          action: { label: 'View details', query: 'show my upcoming appointment' },
          priority: isToday ? 'high' : 'medium',
        });
      }

      // Check for favorited businesses with new availability
      const favoriteCount = await this.prisma.favorite.count({
        where: { userId: context.userId },
      });

      if (favoriteCount > 0) {
        messages.push({
          message: '💫 Your favorite businesses have new availability!',
          action: { label: 'Check favorites', query: 'show my favorite businesses' },
          priority: 'low',
        });
      }

      // Re-booking suggestion based on history
      const lastBooking = await this.prisma.appointment.findFirst({
        where: {
          userId: context.userId,
          status: 'COMPLETED',
        },
        include: {
          business: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      });

      if (lastBooking) {
        const daysSince = Math.floor(
          (Date.now() - lastBooking.date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSince > 30) {
          messages.push({
            message: `🔄 It's been a while since your visit to ${lastBooking.business.name}. Time to book again?`,
            action: { label: 'Book again', query: `book at ${lastBooking.business.name}` },
            priority: 'low',
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error getting customer proactive messages: ${error}`);
    }

    return messages;
  }

  /**
   * Business proactive messages - operations focused
   */
  private async getBusinessProactiveMessages(context: UserContext): Promise<ProactiveMessage[]> {
    const messages: ProactiveMessage[] = [];

    if (!context.businessId) {
      return messages;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Today's appointment count
      const todayAppointments = await this.prisma.appointment.count({
        where: {
          businessId: context.businessId,
          date: { gte: today, lt: tomorrow },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (todayAppointments > 0) {
        messages.push({
          message: `📋 You have ${todayAppointments} appointment${todayAppointments > 1 ? 's' : ''} scheduled today.`,
          action: { label: "Today's schedule", query: 'show my schedule for today' },
          priority: 'high',
        });
      } else if (context.timeOfDay === 'morning') {
        messages.push({
          message: '📭 No appointments today. Want to see tips for boosting bookings?',
          action: { label: 'Booking tips', query: 'how can I get more bookings' },
          priority: 'medium',
        });
      }

      // Unread messages
      const unreadMessages = await this.prisma.message.count({
        where: {
          chat: { businessId: context.businessId },
          read: false,
        },
      });

      if (unreadMessages > 0) {
        messages.push({
          message: `💬 You have ${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''} from customers.`,
          action: { label: 'View messages', query: 'show my unread messages' },
          priority: unreadMessages > 3 ? 'high' : 'medium',
        });
      }

      // Unanswered reviews
      const unansweredReviews = await this.prisma.review.count({
        where: {
          businessId: context.businessId,
          response: null,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      });

      if (unansweredReviews > 0) {
        messages.push({
          message: `⭐ ${unansweredReviews} review${unansweredReviews > 1 ? 's' : ''} waiting for your response.`,
          action: { label: 'Respond to reviews', query: 'show reviews needing response' },
          priority: 'medium',
        });
      }

      // Weekly summary (on Monday mornings)
      if (context.dayOfWeek === 1 && context.timeOfDay === 'morning') {
        messages.push({
          message: "📊 It's Monday! Want to see last week's performance summary?",
          action: { label: 'Weekly summary', query: 'show my weekly performance summary' },
          priority: 'medium',
        });
      }
    } catch (error) {
      this.logger.error(`Error getting business proactive messages: ${error}`);
    }

    return messages;
  }

  /**
   * Get time of day based on hour
   */
  static getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Priority weight for sorting
   */
  private priorityWeight(priority: 'low' | 'medium' | 'high'): number {
    const weights = { low: 1, medium: 2, high: 3 };
    return weights[priority];
  }
}
