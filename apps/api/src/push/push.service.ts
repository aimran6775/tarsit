import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PushSubscription } from '@prisma/client';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface SubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: SubscriptionKeys;
  userAgent?: string;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private isConfigured = false;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@tarsit.com';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
      this.isConfigured = true;
      this.logger.log('Web Push configured successfully');
    } else {
      this.logger.warn(
        'VAPID keys not configured. Push notifications will be disabled. ' +
          'Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.',
      );
    }
  }

  /**
   * Subscribe a user to push notifications
   */
  async subscribe(
    userId: string,
    subscription: PushSubscriptionData,
  ): Promise<{ id: string }> {
    // Check if subscription already exists
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription
      const updated = await this.prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: subscription.userAgent,
          updatedAt: new Date(),
        },
      });
      return { id: updated.id };
    }

    // Create new subscription
    const created = await this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: subscription.userAgent,
      },
    });

    this.logger.log(`Push subscription created for user ${userId}`);
    return { id: created.id };
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });
    this.logger.log(`Push subscription removed for user ${userId}`);
  }

  /**
   * Remove all subscriptions for a user
   */
  async unsubscribeAll(userId: string): Promise<void> {
    const result = await this.prisma.pushSubscription.deleteMany({
      where: { userId },
    });
    this.logger.log(
      `Removed ${result.count} push subscriptions for user ${userId}`,
    );
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn('Push notifications not configured, skipping send');
      return;
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`No push subscriptions found for user ${userId}`);
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
    });

    const sendPromises = subscriptions.map(async (sub: PushSubscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationPayload,
        );
        this.logger.debug(`Push sent to subscription ${sub.id}`);
      } catch (error: unknown) {
        const webPushError = error as { statusCode?: number };
        // Handle expired or invalid subscriptions
        if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
          this.logger.warn(
            `Subscription ${sub.id} is no longer valid, removing...`,
          );
          await this.prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        } else {
          this.logger.error(
            `Failed to send push to subscription ${sub.id}:`,
            error,
          );
        }
      }
    });

    await Promise.all(sendPromises);
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    await Promise.all(userIds.map((userId) => this.sendToUser(userId, payload)));
  }

  /**
   * Send notification for new message
   */
  async notifyNewMessage(
    recipientId: string,
    senderName: string,
    messagePreview: string,
    chatId: string,
  ): Promise<void> {
    await this.sendToUser(recipientId, {
      title: `New message from ${senderName}`,
      body:
        messagePreview.length > 100
          ? messagePreview.substring(0, 97) + '...'
          : messagePreview,
      tag: `chat-${chatId}`,
      data: {
        type: 'message',
        chatId,
        url: `/messages/${chatId}`,
      },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  }

  /**
   * Send notification for appointment reminder
   */
  async notifyAppointmentReminder(
    userId: string,
    businessName: string,
    serviceName: string,
    appointmentTime: Date,
    appointmentId: string,
  ): Promise<void> {
    const timeStr = appointmentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    await this.sendToUser(userId, {
      title: 'Appointment Reminder',
      body: `Your ${serviceName} at ${businessName} is coming up at ${timeStr}`,
      tag: `appointment-${appointmentId}`,
      data: {
        type: 'appointment',
        appointmentId,
        url: `/appointments/${appointmentId}`,
      },
      actions: [{ action: 'view', title: 'View Details' }],
    });
  }

  /**
   * Send notification for appointment status change
   */
  async notifyAppointmentStatusChange(
    userId: string,
    businessName: string,
    status: string,
    appointmentId: string,
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'has been confirmed',
      CANCELLED: 'has been cancelled',
      COMPLETED: 'has been marked as completed',
      NO_SHOW: 'was marked as no-show',
    };

    const message = statusMessages[status] || `status changed to ${status}`;

    await this.sendToUser(userId, {
      title: 'Appointment Update',
      body: `Your appointment at ${businessName} ${message}`,
      tag: `appointment-${appointmentId}`,
      data: {
        type: 'appointment',
        appointmentId,
        status,
        url: `/appointments/${appointmentId}`,
      },
    });
  }

  /**
   * Send notification for new review on business
   */
  async notifyNewReview(
    businessOwnerId: string,
    businessName: string,
    rating: number,
    reviewerName: string,
    reviewId: string,
  ): Promise<void> {
    await this.sendToUser(businessOwnerId, {
      title: 'New Review',
      body: `${reviewerName} left a ${rating}-star review on ${businessName}`,
      tag: `review-${reviewId}`,
      data: {
        type: 'review',
        reviewId,
        rating,
        url: `/business/reviews`,
      },
    });
  }

  /**
   * Get VAPID public key for client subscription
   */
  getPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY || null;
  }

  /**
   * Check if push is configured
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }
}
