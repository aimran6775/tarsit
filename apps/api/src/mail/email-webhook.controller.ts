/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL WEBHOOK CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Handles webhooks from Resend for email events:
 * - Delivered: Email successfully delivered
 * - Bounced: Email bounced (hard or soft)
 * - Complained: Recipient marked as spam
 * - Opened: Email was opened (if tracking enabled)
 * - Clicked: Link in email was clicked
 *
 * Webhook Setup in Resend Dashboard:
 * URL: https://api.tarsit.com/api/webhooks/email
 * Events: email.delivered, email.bounced, email.complained
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    RawBodyRequest,
    Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

// Resend webhook event types
interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Bounce specific
    bounce?: {
      message: string;
      type: 'hard' | 'soft';
    };
    // Click specific
    click?: {
      ipAddress: string;
      link: string;
      timestamp: string;
      userAgent: string;
    };
  };
}

@ApiExcludeController()
@Controller('webhooks')
export class EmailWebhookController {
  private readonly logger = new Logger(EmailWebhookController.name);
  private readonly webhookSecret: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.webhookSecret = this.config.get<string>('RESEND_WEBHOOK_SECRET');
  }

  /**
   * Resend Email Webhook Endpoint
   * POST /api/webhooks/email
   */
  @Post('email')
  @HttpCode(HttpStatus.OK)
  async handleResendWebhook(
    @Body() event: ResendWebhookEvent,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log(`Received Resend webhook: ${event.type}`);

    // Verify webhook signature (optional but recommended)
    if (this.webhookSecret && req.rawBody) {
      const isValid = this.verifySignature(
        req.rawBody.toString(),
        svixId,
        svixTimestamp,
        svixSignature,
      );
      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        return { received: false, error: 'Invalid signature' };
      }
    }

    try {
      const email = event.data.to[0]?.toLowerCase();
      if (!email) {
        return { received: true };
      }

      // Log the event
      await this.prisma.emailEvent.create({
        data: {
          email,
          eventType: this.mapEventType(event.type),
          messageId: event.data.email_id,
          bounceType: event.data.bounce?.type,
          reason: event.data.bounce?.message,
          metadata: event as any,
        },
      });

      // Handle specific event types
      switch (event.type) {
        case 'email.bounced':
          await this.handleBounce(email, event.data.bounce);
          break;
        case 'email.complained':
          await this.handleComplaint(email);
          break;
        case 'email.delivered':
          await this.handleDelivery(email);
          break;
      }

      return { received: true };
    } catch (error: any) {
      this.logger.error(`Webhook processing error: ${error.message}`, error);
      return { received: true }; // Still return 200 to prevent retries
    }
  }

  /**
   * Handle bounce events
   */
  private async handleBounce(
    email: string,
    bounce?: { message: string; type: 'hard' | 'soft' },
  ) {
    this.logger.log(`Processing bounce for ${email}: ${bounce?.type}`);

    const preferences = await this.prisma.emailPreference.findUnique({
      where: { email },
    });

    if (preferences) {
      const updateData: any = {
        bounceCount: preferences.bounceCount + 1,
        lastBounceAt: new Date(),
        bounceType: bounce?.type || 'unknown',
      };

      // Hard bounces or 3+ soft bounces = suppress
      if (bounce?.type === 'hard' || preferences.bounceCount >= 2) {
        updateData.isSupressed = true;
        this.logger.warn(`Suppressing email for ${email} due to bounces`);
      }

      await this.prisma.emailPreference.update({
        where: { email },
        data: updateData,
      });
    } else {
      // Create preferences for new email with bounce data
      await this.prisma.emailPreference.create({
        data: {
          email,
          bounceCount: 1,
          lastBounceAt: new Date(),
          bounceType: bounce?.type || 'unknown',
          isSupressed: bounce?.type === 'hard',
        },
      });
    }
  }

  /**
   * Handle spam complaint events
   */
  private async handleComplaint(email: string) {
    this.logger.warn(`Spam complaint received for ${email}`);

    await this.prisma.emailPreference.upsert({
      where: { email },
      update: {
        complainedAt: new Date(),
        isSupressed: true, // Always suppress after complaint
        unsubscribedAll: true,
      },
      create: {
        email,
        complainedAt: new Date(),
        isSupressed: true,
        unsubscribedAll: true,
      },
    });
  }

  /**
   * Handle successful delivery (reset soft bounce count)
   */
  private async handleDelivery(email: string) {
    const preferences = await this.prisma.emailPreference.findUnique({
      where: { email },
    });

    // If we have soft bounces but email delivered, reset the soft bounce counter
    if (preferences && preferences.bounceType === 'soft' && !preferences.isSupressed) {
      await this.prisma.emailPreference.update({
        where: { email },
        data: {
          bounceCount: 0,
          bounceType: null,
        },
      });
    }
  }

  /**
   * Verify Svix webhook signature
   */
  private verifySignature(
    payload: string,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
  ): boolean {
    if (!this.webhookSecret) return true;

    try {
      const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
      const secret = this.webhookSecret.startsWith('whsec_')
        ? this.webhookSecret.slice(6)
        : this.webhookSecret;

      const secretBytes = Buffer.from(secret, 'base64');
      const expectedSignature = crypto
        .createHmac('sha256', secretBytes)
        .update(signedContent)
        .digest('base64');

      // svixSignature format: "v1,signature1 v1,signature2..."
      const signatures = svixSignature.split(' ').map((s) => s.split(',')[1]);
      return signatures.some((sig) => sig === expectedSignature);
    } catch {
      return false;
    }
  }

  /**
   * Map Resend event type to our internal type
   */
  private mapEventType(resendType: string): string {
    const mapping: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
    };
    return mapping[resendType] || resendType;
  }
}
